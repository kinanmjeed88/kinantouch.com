import subprocess
import os

os.chdir("/app/kinantouch_repo")
subprocess.run(["git", "pull", "--rebase", "origin", "main"])
subprocess.run(["git", "push", "origin", "main"])
