#!/usr/bin/env bash
# Publishes non-draft posts from Obsidian Vault/Blog/ to my-blog/posts/

VAULT_DIR="$HOME/Documents/Obsidian Vault/Blog"
BLOG_DIR="$HOME/Desktop/Claude/my-blog/posts"
LOG="$HOME/Desktop/Claude/my-blog/scripts/publish.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "--- publish run start ---"

find "$VAULT_DIR" -name "*.md" | while read -r file; do
	# Check if draft: false (explicit) or draft field is absent
	if grep -q '^draft:' "$file"; then
		draft_val=$(grep '^draft:' "$file" | head -1 | awk '{print $2}')
		if [ "$draft_val" = "true" ]; then
			continue
		fi
	fi

	# Derive slug from filename
	basename=$(basename "$file" .md)
	# If filename already has YYYY-MM-DD prefix, keep it; otherwise prepend today
	if echo "$basename" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}-'; then
		slug="$basename"
	else
		today=$(date '+%Y-%m-%d')
		slug="${today}-${basename}"
	fi

	dest="$BLOG_DIR/${slug}.md"

	if [ -f "$dest" ]; then
		log "SKIP (already exists): $dest"
		continue
	fi

	cp "$file" "$dest"
	log "PUBLISHED: $file -> $dest"

	# Mark original as draft: true
	if grep -q '^draft:' "$file"; then
		# Replace existing draft line
		sed -i '' 's/^draft: .*/draft: true/' "$file"
	else
		# Insert draft: true after the opening ---
		sed -i '' '/^---$/{n;s/^/draft: true\n/;}' "$file"
	fi
	log "DRAFTED: $file"
done

log "--- publish run end ---"
