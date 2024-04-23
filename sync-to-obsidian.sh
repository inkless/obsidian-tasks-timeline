#!/bin/bash

# Define source and destination directories
source_dir=$(pwd)
dest_dir=$1

# Check if at least one argument is provided
if [ -z "$dest_dir" ]; then
    echo "Error: no destination dir specified"
    exit 1
fi

path_to_watch=$source_dir/main.js

# Function to copy files 
sync_files() {
    echo "Copying $path_to_watch to $dest_dir"
    cp "$path_to_watch" "$dest_dir"
}

echo "Watching $path_to_watch"

# Start watching the file for changes
fswatch -o "$path_to_watch" | while read -r
do
    sync_files
done
