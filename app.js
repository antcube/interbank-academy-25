const fs = require('fs');
const path = require('path');

// Función para leer y procesar el archivo CSV
function procesarTransacciones(archivo) {
    let balanceFinal = 0;
    let transaccionMayor = { id: null, monto: 0 };
    let conteoCreditos = 0;
    let conteoDebitos = 0;

    const rutaArchivo = path.join(__dirname, archivo);

    // Verificar si el archivo existe antes de leerlo
    if (!fs.existsSync(rutaArchivo)) {
        throw new Error(`El archivo "${archivo}" no existe.`);
    }

    const datosCSV = fs.readFileSync(rutaArchivo, 'utf-8');
    const lineas = datosCSV.split('\n').map(linea => linea.trim()).filter(linea => linea);

    // Verificar que haya datos y al menos una fila después del encabezado
    if (lineas.length <= 1) {
        throw new Error('El archivo CSV no tiene suficientes datos.');
    }

    for (let i = 1; i < lineas.length; i++) {
        const fila = lineas[i];

        const [id, tipo, monto] = fila.split(',');

        const montoFloat = parseFloat(monto);

        // Validar si el monto es un número válido
        if (isNaN(montoFloat)) {
            console.warn(`Advertencia: Transacción con ID ${id} tiene un monto inválido y será ignorada.`);
            continue;
        }

        // Normalizar tipo para evitar errores por mayúsculas o tildes
        const tipoStandard = tipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        if (tipoStandard === 'credito') {
            balanceFinal += montoFloat;
            conteoCreditos++;
        } else if (tipoStandard === 'debito') {
            balanceFinal -= montoFloat;
            conteoDebitos++;
        } else {
            console.warn(`Advertencia: Tipo de transacción desconocido en ID ${id}, será ignorado.`);
            continue;
        }

        // Identificar la transacción de mayor monto
        if (montoFloat > transaccionMayor.monto) {
            transaccionMayor = { id, monto: montoFloat };
        }
    }

    return {
        balanceFinal,
        transaccionMayor,
        conteoCreditos,
        conteoDebitos
    };
}

// Función para mostrar los resultados
function mostrarResultados(data) {
    console.log('Reporte de Transacciones:');
    console.log('---------------------------------------------');
    console.log(`Balance Final: S/ ${data.balanceFinal.toFixed(2)}`);

    if (data.transaccionMayor.id !== null) {
        console.log(`Transacción Mayor: ID ${data.transaccionMayor.id}, Monto S/ ${data.transaccionMayor.monto.toFixed(2)}`);
    } else {
        console.log('No se encontró ninguna transacción válida.');
    }

    console.log(`Total Créditos: ${data.conteoCreditos}`);
    console.log(`Total Débitos: ${data.conteoDebitos}`);
    console.log('---------------------------------------------');
}

// Función principal
function main() {
    const archivo = 'data.csv';

    try {
        const data = procesarTransacciones(archivo);
        mostrarResultados(data);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Ejecutar la función principal
main();