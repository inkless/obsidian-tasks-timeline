#!/bin/bash

# Define source and destination directories
source_dir=$(pwd)
dest_dir=$1

# Check if at least one argument is provided
if [ -z "$dest_dir" ]; then
    echo "Error: no destination dir specified"
    exit 1
fi


# Function to copy files 
sync_files() {
    echo "Copying $source_dir/main.js to $dest_dir"
    cp "$source_dir/main.js" "$dest_dir"
}

echo "Watching $source_dir/main.js"

# Main loop to watch for file changes
while inotifywait -e modify "$source_dir/main.js"; do
    sync_files
done

