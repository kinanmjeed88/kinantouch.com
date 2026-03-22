import os
import requests
import json
import base64
import subprocess

TOKEN = "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"
REPO = "kinantouch.com"
OWNER = "kinanmjeed88"
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def get_ref(branch="main"):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/ref/heads/{branch}"
    resp = requests.get(url, headers=HEADERS)
    return resp.json()["object"]["sha"]

def get_commit(commit_sha):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/commits/{commit_sha}"
    resp = requests.get(url, headers=HEADERS)
    return resp.json()

def create_blob(content):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/blobs"
    data = {"content": base64.b64encode(content).decode("utf-8"), "encoding": "base64"}
    resp = requests.post(url, headers=HEADERS, json=data)
    if "sha" not in resp.json():
        print(f"Failed to create blob: {resp.json()}")
    return resp.json()["sha"]

def create_tree(base_tree_sha, tree_data):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/trees"
    data = {"base_tree": base_tree_sha, "tree": tree_data}
    resp = requests.post(url, headers=HEADERS, json=data)
    if "sha" not in resp.json():
        print(f"Failed to create tree: {resp.json()}")
    return resp.json()["sha"]

def create_commit(message, tree_sha, parent_shas):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/commits"
    data = {"message": message, "tree": tree_sha, "parents": parent_shas}
    resp = requests.post(url, headers=HEADERS, json=data)
    return resp.json()["sha"]

def update_ref(branch, new_commit_sha):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/refs/heads/{branch}"
    data = {"sha": new_commit_sha}
    resp = requests.patch(url, headers=HEADERS, json=data)
    return resp.json()

# get modified files from git status
status_output = subprocess.check_output("git status --porcelain", shell=True).decode('utf-8')
files_to_commit = []
for line in status_output.splitlines():
    status = line[:2]
    filename = line[3:]
    # remove quotes if any
    if filename.startswith('"') and filename.endswith('"'):
        filename = filename[1:-1]
    if status in [" M", "??", "M ", "A "]:
        files_to_commit.append(filename)

if not files_to_commit:
    print("No files to commit.")
    exit(0)

print(f"Files to commit: {len(files_to_commit)}")

latest_commit_sha = get_ref("main")
latest_commit = get_commit(latest_commit_sha)
base_tree_sha = latest_commit["tree"]["sha"]

tree_items = []
for fpath in files_to_commit:
    try:
        if os.path.exists(f"{fpath}"):
            with open(f"{fpath}", "rb") as f:
                content = f.read()
            blob_sha = create_blob(content)
            tree_items.append({
                "path": fpath,
                "mode": "100644",
                "type": "blob",
                "sha": blob_sha
            })
    except Exception as e:
        print(f"Skipping {fpath} due to error: {e}")

if tree_items:
    new_tree_sha = create_tree(base_tree_sha, tree_items)
    new_commit_sha = create_commit("feat: dynamic categories management in CMS and frontend tabs", new_tree_sha, [latest_commit_sha])
    update_ref("main", new_commit_sha)
    print("Successfully pushed fixes for dynamic categories.")
else:
    print("No updates needed.")
