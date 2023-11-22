import os
import json
import requests

def download_html(url, file_path):
    response = requests.get(url)
    
    if response.status_code == 200:
        html_content = response.text

        # Save the HTML to a file with a generated name
        with open(file_path, 'w', encoding='utf-8') as html_file:
            html_file.write(html_content)

        print(f"HTML content for {url} saved in {file_path}")
    else:
        print(f"Failed to fetch {url}. Status code: {response.status_code}")

def main():
    # Create 'html' folder if it doesn't exist
    if not os.path.exists('html'):
        os.makedirs('html')

    with open('links.json', 'r') as file:
        data = json.load(file)

    for link_data in data['links']:
        url = link_data['url']
        course = link_data['course']
        section = link_data['section']

        # Generate file path based on the specified format
        file_name = f"ccnav7-{course}-{section}.html"
        file_path = os.path.join('html', file_name)

        download_html(url, file_path)

if __name__ == "__main__":
    main()
