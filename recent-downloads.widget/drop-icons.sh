#!/bin/bash
# Emit the three most recent Downloads files as `mtime|size|path|base64png`
# lines. Each thumbnail is a QuickLook content thumbnail when the file type
# supports one, otherwise the NSWorkspace file-type icon. Thumbnails are cached
# by path and mtime, so qlmanage/osascript run only for new or changed files.

CACHE="${TMPDIR:-/tmp}/uebersicht-drop"
mkdir -p "$CACHE"

HELPER="$CACHE/icon.js"
cat > "$HELPER" <<'JS'
ObjC.import('AppKit'); ObjC.import('Foundation');
function run(argv) {
  var p = argv[0], out = argv[1], s = parseInt(argv[2] || '128');
  var icon = $.NSWorkspace.sharedWorkspace.iconForFile(p);
  icon.setSize($.NSMakeSize(s, s));
  var rep = $.NSBitmapImageRep.alloc.initWithData(icon.TIFFRepresentation);
  var png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  png.writeToFileAtomically($(out), true);
}
JS

# Extensions worth handing to QuickLook. qlmanage can hang on archives and
# similar types, so everything else takes the NSWorkspace file-type icon.
case_preview() {
  case "$1" in
    png|jpg|jpeg|gif|heic|heif|webp|tiff|tif|bmp|pdf|mov|mp4|m4v|txt|md|rtf|csv) return 0 ;;
    *) return 1 ;;
  esac
}

find "$HOME/Downloads" -maxdepth 1 -type f -not -name '.*' \
  -not -name '*.crdownload' -not -name '*.part' -not -name '*.download' -not -name '*.tmp' \
  -print0 | xargs -0 stat -f '%m|%z|%N' 2>/dev/null | sort -rn | head -3 | \
while IFS='|' read -r mt sz path; do
  key=$(printf '%s-%s' "$path" "$mt" | md5 2>/dev/null | awk '{print $NF}')
  thumb="$CACHE/$key.png"
  if [ ! -s "$thumb" ]; then
    name="${path##*/}"; ext="${name##*.}"
    ext=$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')
    if case_preview "$ext"; then
      qldir="$CACHE/ql-$key"
      rm -rf "$qldir"; mkdir -p "$qldir"
      # Cap qlmanage at 6s via perl alarm so a stuck generator cannot hang us.
      perl -e 'alarm shift; exec @ARGV' 6 \
        qlmanage -t -s 128 -o "$qldir" "$path" >/dev/null 2>&1 </dev/null
      ql=$(find "$qldir" -name '*.png' -type f 2>/dev/null | head -1)
      [ -n "$ql" ] && [ -s "$ql" ] && mv "$ql" "$thumb"
      rm -rf "$qldir"
    fi
    # No content thumbnail produced: fall back to the file-type icon.
    [ -s "$thumb" ] || osascript -l JavaScript "$HELPER" "$path" "$thumb" 128 >/dev/null 2>&1 </dev/null
    # File-type icons embed a 1024px rep; cap at 128px to keep the base64 small.
    [ -s "$thumb" ] && sips -Z 128 "$thumb" >/dev/null 2>&1
  fi
  if [ -s "$thumb" ]; then b64=$(base64 < "$thumb" | tr -d '\n'); else b64=""; fi
  printf '%s|%s|%s|%s\n' "$mt" "$sz" "$path" "$b64"
done

# Evict cached thumbnails older than a day to keep the cache small.
find "$CACHE" -name '*.png' -type f -mtime +1 -delete 2>/dev/null
true
