import subprocess
import os

os.chdir("/app/kinantouch_repo")
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", "Fix canonical URLs mismatch by removing .html extension in global scope to match sitemap"])
subprocess.run(["git", "push", "origin", "main"])
