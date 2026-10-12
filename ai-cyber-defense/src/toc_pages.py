"""PDF-ээс гарчгийн (H1, H2) хуудасны дугаарыг олж JSON хэлбэрээр хэвлэнэ."""
import json, re, subprocess, sys
pdf, md = sys.argv[1], sys.argv[2]
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
pages = []
for i in range(1, n + 1):
    t = subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), pdf, "-"], capture_output=True, text=True).stdout
    pages.append(re.sub(r"\s+", " ", t))
heads = []
for line in open(md, encoding="utf-8"):
    m = re.match(r"^(#{1,2}) (.+?)\s*$", line)
    if m:
        heads.append((len(m.group(1)), m.group(2).strip()))
# Гарчгийн хуудсуудыг (цэгэн заагчтай) хайлтаас хасна
toc_last = max([i for i in range(min(5, n)) if "......" in pages[i]], default=-1)
result, start = [], toc_last + 1
for level, title in heads:
    key = re.sub(r"\s+", " ", title)[:40]
    page = None
    for i in range(start, n):
        if key in pages[i]:
            page, start = i + 1, i
            break
    result.append({"level": level, "title": title, "page": page})
json.dump(result, sys.stdout, ensure_ascii=False)
