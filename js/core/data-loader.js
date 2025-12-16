// data-loader.js - ЗАГРУЗЧИК ДАННЫХ

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let blackMetals = {};
let indexData = {};
let currentSortData = {};

// ОСНОВНЫЕ ФУНКЦИИ

/**
 * ЗАГРУЗКА ДАННЫХ СОРТАМЕНТА
 */
window.loadSortData = function(sortType) {
    return new Promise((resolve, reject) => {
        // ИСПРАВЛЕННЫЙ ПУТЬ: убрали ../
        const filePath = `data/sorts/black_metals/${sortType}.json`;

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Файл не найден: ${filePath}`));
                    return;
                }
                return response.json();
            })
            .then(data => {
                currentSortData = data;
                window.currentSortData = data;

                // Вызываем модуль если он есть
                if (window.sortModules && window.sortModules[sortType] && window.sortModules[sortType].showParameters) {
                    window.sortModules[sortType].showParameters();
                } else {
                    showDefaultParameters(sortType);
                }

                resolve(data);
            })
            .catch(error => {
                console.log('❌ Ошибка загрузки:', sortType);
                useTestDataForSortament(sortType);
                resolve(currentSortData);
            });
    });
};


/**
 * ИСПОЛЬЗОВАНИЕ ТЕСТОВЫХ ДАННЫХ
 */
function useTestDataForSortament(sortType) {
    const baseTemplate = {
        product_name: "Изделие",
        standard: "ГОСТ не указан",
        designation_components: {
            numerator: "{parameters} {standard}",
            denominator: "{material} {material_standard}"
        }
    };

    const testTemplates = {
        round_bar: {
            ...baseTemplate,
            product_name: "Пруток",
            standard: "ГОСТ 2590-2006",
            accuracy_classes: ["h11", "h12", "h13"],
            designation_components: {
                numerator: "{accuracy}-{diameter} {standard}",
                denominator: "{material} {material_standard}"
            },
            materials: {
                "Ст3сп": { diameters_mm: [10, 12, 14, 16, 18, 20, 22, 25, 28, 30] },
                "45": { diameters_mm: [5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40] }
            }
        },

        tube_round: {
            ...baseTemplate,
            product_name: "Труба",
            standard: "ГОСТ 8734-75",
            designation_components: {
                numerator: "{diameter}×{wall_thickness} {standard}",
                denominator: "{material} {material_standard}"
            },
            diameters_mm: [10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50],
            wall_thickness_mm: [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0, 3.5, 4.0]
        }
    };

    currentSortData = testTemplates[sortType] || baseTemplate;
    window.currentSortData = currentSortData;

    // Вызываем модуль или показываем сообщение
    if (window.sortModules && window.sortModules[sortType] && window.sortModules[sortType].showParameters) {
        window.sortModules[sortType].showParameters();
    } else {
        showDefaultParameters(sortType);
    }
}

/**
 * ЗАГРУЗКА РЕАЛЬНЫХ МАТЕРИАЛОВ
 */
function loadRealMaterials() {
    const filePath = '../data/materials/black_metals.json';

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}`);
            }
            return response.json();
        })
        .then(parsedData => {
            blackMetals = parsedData;
            window.blackMetals = parsedData;

            // Заполняем список материалов
            if (typeof fillMaterialSelect === 'function') {
                fillMaterialSelect();
            }
        })
        .catch(error => {
            console.log('⚠️ Используем тестовые материалы');
            useTestMaterials();
        });
}

/**
 * ИСПОЛЬЗОВАНИЕ ТЕСТОВЫХ МАТЕРИАЛОВ
 */
function useTestMaterials() {
    blackMetals = testBlackMetals;
    indexData = testIndexData;

    window.blackMetals = blackMetals;
    window.indexData = indexData;

    if (typeof fillMaterialSelect === 'function') {
        fillMaterialSelect();
    }
}

/**
 * ПОКАЗАТЬ ПАРАМЕТРЫ ПО УМОЛЧАНИЮ
 */
function showDefaultParameters(sortType) {
    const paramsContent = document.getElementById('paramsContent');
    if (!paramsContent) {
        console.error('❌ Не найден paramsContent');
        return;
    }

    paramsContent.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #856404;">
                <strong>⚠️ Модуль для "${sortType}" не реализован</strong>
            </p>
            <p style="margin: 0; font-size: 0.9em;">
                Создай файл: <code>src/js/sorts/${sortType}.js</code>
            </p>
        </div>
    `;

    const paramsContainer = document.getElementById('paramsContainer');
    if (paramsContainer) {
        paramsContainer.style.display = 'block';
    }
}

/**
 * ЗАПОЛНИТЬ ВЫПАДАЮЩИЙ СПИСОК МАТЕРИАЛОВ
 */
function fillMaterialSelect() {
    const select = document.getElementById('materialSelect');
    if (!select) {
        console.error('❌ Не найден materialSelect');
        return;
    }

    select.innerHTML = '<option value="">-- Выбери материал --</option>';

    const materials = window.blackMetals || blackMetals;

    if (!materials || Object.keys(materials).length === 0) {
        select.innerHTML += '<option value="" disabled>⚠️ Материалы не загружены</option>';
        return;
    }

    for (const materialKey in materials) {
        const material = materials[materialKey];
        const option = document.createElement('option');
        option.value = materialKey;
        option.textContent = material.наименование || materialKey;
        select.appendChild(option);
    }
}

/**
 * ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
 */
function initializeSystem() {
    const indexPath = '../data/materials/index.json';

    fetch(indexPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки индекса`);
            }
            return response.json();
        })
        .then(data => {
            indexData = data;
            window.indexData = data;

            // Загружаем материалы после индекса
            loadRealMaterials();
        })
        .catch(error => {
            console.log('⚠️ Используем тестовый индекс');
            useTestMaterials();
        });
}

// ЗАПУСК СИСТЕМЫ
document.addEventListener('DOMContentLoaded', initializeSystem);

// Экспортируем функции
window.loadSortData = loadSortData;
window.fillMaterialSelect = fillMaterialSelect;
window.showDefaultParameters = showDefaultParameters;
