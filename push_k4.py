import subprocess
import os

os.chdir("/app/kinantouch_repo")
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", "Fix missing Facebook and Instagram icons in share buttons"])
subprocess.run(["git", "push", "origin", "main"])
