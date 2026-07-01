import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response
from pdf2docx import Converter

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/convert")
async def convert(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드할 수 있습니다.")

    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = Path(tmpdir) / "input.pdf"
        docx_path = Path(tmpdir) / "output.docx"

        content = await file.read()
        pdf_path.write_bytes(content)

        try:
            cv = Converter(str(pdf_path))
            cv.convert(str(docx_path))
            cv.close()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"변환 실패: {exc}") from exc

        docx_bytes = docx_path.read_bytes()

    filename = Path(file.filename).stem + ".docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
