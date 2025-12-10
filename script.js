document.addEventListener('DOMContentLoaded', () => {
    const querySelector = document.querySelector.bind(document);
    const plannerArea = document.getElementById('planner-area');
    const essayText = document.getElementById('essay-text');
    const essayTitle = document.getElementById('essay-title');
    const lineNumbersContainer = document.getElementById('line-numbers');
    const fontFamilySel = document.getElementById('fontFamily');
    const fontSizeSel = document.getElementById('fontSize');
    const lineCountDisplay = document.getElementById('line-count-display');
    const paperContainer = document.getElementById('essay-paper');

    function loadSavedData() {
        if (localStorage.getItem('plannerText')) {
            plannerArea.value = localStorage.getItem('plannerText');
        }
        if (localStorage.getItem('essayText')) {
            essayText.value = localStorage.getItem('essayText');
        }
        if (localStorage.getItem('essayTitle')) {
            essayTitle.value = localStorage.getItem('essayTitle');
        }
        if (localStorage.getItem('fontFamily')) {
            fontFamilySel.value = localStorage.getItem('fontFamily');
            updateFont();
        }
        if (localStorage.getItem('fontSize')) {
            fontSizeSel.value = localStorage.getItem('fontSize');
            updateFontSize();
        }
        updateLineCount();
    }

    function saveData() {
        localStorage.setItem('plannerText', plannerArea.value);
        localStorage.setItem('essayText', essayText.value);
        localStorage.setItem('essayTitle', essayTitle.value);
        localStorage.setItem('fontFamily', fontFamilySel.value);
        localStorage.setItem('fontSize', fontSizeSel.value);
    }

    function updateFont() {
        essayText.style.fontFamily = fontFamilySel.value;
        saveData();
    }

    function updateFontSize() {
        paperContainer.classList.remove('font-small', 'font-medium', 'font-large');
        paperContainer.classList.add(`font-${fontSizeSel.value}`);
        saveData();
    }

    function updateLineCount() {
        const lineHeight = 32;
        const lines = Math.floor(essayText.scrollHeight / lineHeight);

        lineCountDisplay.textContent = lines;

        if (lines > 30) {
            lineCountDisplay.style.color = 'red';
            lineCountDisplay.style.fontWeight = 'bold';
        } else {
            lineCountDisplay.style.color = '#6b7280';
            lineCountDisplay.style.fontWeight = 'normal';
        }
    }

    for (let i = 1; i <= 30; i++) {
        const div = document.createElement('div');
        div.className = 'line-number';
        div.textContent = i;
        lineNumbersContainer.appendChild(div);
    }

    plannerArea.addEventListener('input', saveData);
    essayTitle.addEventListener('input', saveData);

    essayText.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);

            this.selectionStart = this.selectionEnd = start + 4;

            saveData();
            updateLineCount();
        }
    });

    essayText.addEventListener('input', () => {
        saveData();
        updateLineCount();
    });

    fontFamilySel.addEventListener('change', updateFont);
    fontSizeSel.addEventListener('change', updateFontSize);

    loadSavedData();
    updateFont();
    updateFontSize();



    document.getElementById('btn-txt').addEventListener('click', () => {
        const title = essayTitle.value || "Sem Título";
        const text = `TÍTULO: ${title}\n\nPLANEJAMENTO:\n${plannerArea.value}\n\nREDAÇÃO:\n${essayText.value}`;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "redacao.txt");
    });

    document.getElementById('btn-docx').addEventListener('click', () => {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
        const title = essayTitle.value || "Redação - redacao.online";

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: "Planejamento:",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        children: [new TextRun(plannerArea.value)],
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: "Redação Final:",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...essayText.value.split('\n').map(line => new Paragraph({
                        children: [new TextRun(line)]
                    }))
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "redacao.docx");
        });
    });

    document.getElementById('btn-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const title = essayTitle.value || "Redação - redacao.online";

        doc.setFontSize(18);
        doc.text(title, 10, 10);

        doc.setFontSize(12);
        doc.text("Planejamento:", 10, 30);

        const planLines = doc.splitTextToSize(plannerArea.value, 180);
        doc.text(planLines, 10, 40);

        let lastY = 40 + (planLines.length * 7);

        doc.text("Redação Final:", 10, lastY + 10);

        const essayLines = doc.splitTextToSize(essayText.value, 180);
        doc.text(essayLines, 10, lastY + 20);

        doc.save("redacao.pdf");
    });

});
