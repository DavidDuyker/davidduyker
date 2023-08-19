import os
import hashlib

def get_content_between_comments(file_path, start_comment, end_comment):
    with open(file_path, 'r') as file:
        content = file.read()
        start_index = content.find(start_comment)
        end_index = content.find(end_comment, start_index)
        if start_index != -1 and end_index != -1:
            extracted_content = content[start_index + len(start_comment):end_index].strip()
            return extracted_content
        else:
            return None

def compare_content_between_comments(files, start_comment, end_comment):
    reference_hash = None
    different_files = []

    for file_path in files:
        content = get_content_between_comments(file_path, start_comment, end_comment)
        
        if content is None:
            print(f"Comments not found in {file_path}")
            # Don't return here, continue to the next file
        else:
            content_hash = hashlib.sha256(content.encode()).hexdigest()

            if reference_hash is None:
                reference_hash = content_hash
            elif content_hash != reference_hash:
                print(f"Content mismatch in {file_path}")
                different_files.append(file_path)
    
    return different_files

def get_html_files_recursive(folder_path):
    html_files = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith('.html') and "old_site" not in root:
                html_files.append(os.path.join(root, file))
    return html_files

if __name__ == "__main__":
    folder_path = "/Users/davidduyker/Development/davidduyker/"
    start_comment = "<!-- REPEATED -->"
    end_comment = "<!-- END REPEATED -->"

    html_files = get_html_files_recursive(folder_path)

    print("Files checked:")
    for file_path in html_files:
        print(file_path)

    different_files = compare_content_between_comments(html_files, start_comment, end_comment)

    if different_files:
        print("\nFiles with different content between comments:")
        for file_path in different_files:
            print(file_path)
    else:
        print("\nAll files have the same content between comments.")
