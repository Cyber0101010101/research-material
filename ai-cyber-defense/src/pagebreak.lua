-- \newpage гэсэн raw LaTeX блокийг DOCX-ийн хуудас таслалт болгон хувиргана.
function RawBlock(el)
  if el.format:match("tex") and el.text:match("\\newpage") then
    return pandoc.RawBlock("openxml", '<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
  end
end
