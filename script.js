// Elementi DOM
const form = document.getElementById('data-form');
const labelInput = document.getElementById('label');
const valueInput = document.getElementById('value');
const chartCanvas = document.getElementById('chartCanvas').getContext('2d');
const chartTypeSelect = document.getElementById('chart-type');
const updateChartBtn = document.getElementById('update-chart');
const resetDataBtn = document.getElementById('reset-data');
const exportDataBtn = document.getElementById('export-json');
const exportExcelBtn = document.getElementById('export-excel');
const exportPdfBtn = document.getElementById('export-pdf');
const importJsonInput = document.getElementById('import-json');
const filterMinInput = document.getElementById('filter-min');
const filterMaxInput = document.getElementById('filter-max');
const applyFilterBtn = document.getElementById('apply-filter');
const summaryText = document.getElementById('summary-text');

// Dati iniziali
let data = {
    labels: [],
    values: []
};

// Configurazione iniziale del grafico
let chart = new Chart(chartCanvas, {
    type: 'line',
    data: {
        labels: data.labels,
        datasets: [{
            label: 'Dati Inseriti',
            data: data.values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        }
    }
});

// Funzione per aggiornare il grafico
function updateChart(type) {
    chart.destroy(); // Distruggi il grafico corrente
    chart = new Chart(chartCanvas, {
        type: type,
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Dati Inseriti',
                data: data.values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Funzione per aggiornare il resoconto
function updateSummary() {
    if (data.values.length === 0) {
        summaryText.textContent = 'Nessun dato disponibile.';
        return;
    }
    const total = data.values.reduce((acc, val) => acc + val, 0);
    const average = (total / data.values.length).toFixed(2);
    const max = Math.max(...data.values);
    const min = Math.min(...data.values);
    summaryText.innerHTML = `
        <p><strong>Totale:</strong> ${total}</p>
        <p><strong>Media:</strong> ${average}</p>
        <p><strong>Massimo:</strong> ${max}</p>
        <p><strong>Minimo:</strong> ${min}</p>
    `;
}

// Funzione per filtrare i dati
function filterData(min, max) {
    if (isNaN(min) || isNaN(max)) {
        alert('Inserisci valori validi per il filtro.');
        return;
    }
    const filteredLabels = [];
    const filteredValues = [];
    data.labels.forEach((label, index) => {
        const value = data.values[index];
        if (value >= min && value <= max) {
            filteredLabels.push(label);
            filteredValues.push(value);
        }
    });

    // Aggiorna il grafico con i dati filtrati
    chart.destroy();
    chart = new Chart(chartCanvas, {
        type: chartTypeSelect.value,
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'Dati Filtrati',
                data: filteredValues,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Eventi principali
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = labelInput.value.trim();
    const value = parseFloat(valueInput.value);
    if (label && !isNaN(value)) {
        data.labels.push(label);
        data.values.push(value);
        updateChart(chart.config.type);
        updateSummary();
        form.reset();
    } else {
        alert('Inserisci un\'etichetta e un valore validi.');
    }
});

updateChartBtn.addEventListener('click', () => {
    const selectedType = chartTypeSelect.value;
    updateChart(selectedType);
});

resetDataBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler resettare i dati?')) {
        data = { labels: [], values: [] };
        updateChart(chart.config.type);
        updateSummary();
    }
});

exportDataBtn.addEventListener('click', () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
});

exportExcelBtn.addEventListener('click', () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = data.labels.map((label, index) => ({
        Etichetta: label,
        Valore: data.values[index]
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati');
    XLSX.writeFile(workbook, 'dati.xlsx');
});

exportPdfBtn.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Resoconto Dati', 10, 10);
    let y = 20;
    data.labels.forEach((label, index) => {
        pdf.setFontSize(12);
        pdf.text(`Etichetta: ${label} - Valore: ${data.values[index]}`, 10, y);
        y += 10;
    });
    pdf.save('dati.pdf');
});

importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const importedData = JSON.parse(event.target.result);
            data = importedData;
            updateChart(chart.config.type);
            updateSummary();
        };
        reader.readAsText(file);
    }
});

applyFilterBtn.addEventListener('click', () => {
    const min = parseFloat(filterMinInput.value);
    const max = parseFloat(filterMaxInput.value);
    filterData(min, max);
});
