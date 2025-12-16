// app-core.js - ГЛАВНЫЙ ФАЙЛ ЯДРА СИСТЕМЫ
// ==========================================
// ⚙️ ИНИЦИАЛИЗАЦИЯ И ОСНОВНЫЕ ФУНКЦИИ
// ==========================================

// Глобальные переменные
window.currentSortData = window.currentSortData || {};
window.sortModules = window.sortModules || {};
window.selectionMode = window.selectionMode || 'material_first';

/**
 * ПОЛУЧЕНИЕ СТАНДАРТА МАТЕРИАЛА
 */
window.getMaterialStandard = function(materialKey, sortType) {
    // 1. Проверяем исключения в material_overrides
    if (window.indexData?.material_overrides?.[materialKey]?.[sortType]?.material_standard) {
        return window.indexData.material_overrides[materialKey][sortType].material_standard;
    }

    // 2. Проверяем стандарт материала в текущем сортаменте
    if (window.currentSortData?.material_standard_logic?.[materialKey]) {
        return window.currentSortData.material_standard_logic[materialKey];
    }

    // 3. Проверяем ОБЩИЙ стандарт материала в сортаменте
    if (window.currentSortData?.material_standard) {
        return window.currentSortData.material_standard;
    }

    // 4. Берем стандарт по умолчанию из black_metals.json
    if (window.blackMetals?.[materialKey]?.material_standard) {
        return window.blackMetals[materialKey].material_standard;
    }

    return 'ГОСТ не указан';
};

/**
 * ЗАПОЛНЕНИЕ СПИСКА МАТЕРИАЛОВ В ЗАДАННОМ ПОРЯДКЕ
 */
window.fillMaterialSelect = function() {
    const select = document.getElementById('materialSelect');
    if (!select) {
        console.error('❌ Не найден materialSelect');
        return;
    }

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Выбери материал --</option>';

    if (!window.blackMetals || Object.keys(window.blackMetals).length === 0) {
        select.innerHTML += '<option value="" disabled>⚠️ Материалы не загружены</option>';
        return;
    }

    // Получаем порядок из material_priority или используем порядок из объекта
    const materialPriority = window.blackMetals.material_priority || [];
    let materials = [];

    if (materialPriority.length > 0) {
        materialPriority.forEach(materialKey => {
            const materialData = window.blackMetals[materialKey];
            if (materialData && materialData.наименование) {
                materials.push({
                    key: materialKey,
                    name: materialData.наименование
                });
            }
        });
    } else {
        for (const [key, data] of Object.entries(window.blackMetals)) {
            if (typeof data === 'object' && data && data.наименование) {
                materials.push({
                    key,
                    name: data.наименование
                });
            }
        }
    }

    // Добавляем опции в заданном порядке
    materials.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat.key;
        option.textContent = mat.name;
        select.appendChild(option);
    });

    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
};
/**
 * ОПРЕДЕЛЯЕМ ТИП МАТЕРИАЛА И СООТВЕТСТВУЮЩИЙ СОРТАМЕНТ
 */
window.getSortTypeForMaterial = function(materialKey) {
    if (!materialKey || !window.blackMetals) return null;

    const materialData = window.blackMetals[materialKey];
    if (!materialData) return null;

    // Проверяем по наименованию
    const name = materialData.наименование || '';

    // 1. Литейные стали (оканчиваются на "Л")
    if (name.endsWith('Л') || name.includes('литье')) {
        return 'foundry_alloys';
    }

    // 2. Спечённые сплавы (ВК, ТК, ТТК и т.д.)
    const sinteredPatterns = ['ВК', 'ТК', 'ТТК', 'ИС', 'ОМ', 'СТМ'];
    for (const pattern of sinteredPatterns) {
        if (name.startsWith(pattern)) {
            return 'sintered_alloys';
        }
    }

    // 3. Чугун литейный
    if (name.startsWith('СЧ')) {
        return 'foundry_alloys';
    }

    // 4. Проверяем default_sort_types
    if (materialData.default_sort_types && materialData.default_sort_types.length > 0) {
        // Если в default_sort_types только один вариант — возвращаем его
        if (materialData.default_sort_types.length === 1) {
            return materialData.default_sort_types[0];
        }
    }

    return null;
};

/**
 * АВТОМАТИЧЕСКИЙ ВЫБОР СОРТАМЕНТА ПО МАТЕРИАЛУ
 */
window.autoSelectSortForMaterial = function(materialKey) {
    const sortType = window.getSortTypeForMaterial(materialKey);
    const sortSelect = document.getElementById('sortSelect');

    if (!sortType || !sortSelect) return false;

    // Устанавливаем значение в селект
    sortSelect.value = sortType;

    // Триггерим событие change
    if (typeof Event === 'function') {
        sortSelect.dispatchEvent(new Event('change'));
    } else {
        // Fallback для старых браузеров
        const event = document.createEvent('HTMLEvents');
        event.initEvent('change', false, true);
        sortSelect.dispatchEvent(event);
    }

    return true;
};
/**
 * ЗАПОЛНЕНИЕ СПИСКА СОРТАМЕНТОВ С ПРИОРИТЕТОМ
 */
window.fillSortSelect = function() {
    const select = document.getElementById('sortSelect');
    if (!select) {
        console.error('❌ Не найден sortSelect');
        return;
    }

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Выбери сортамент --</option>';

    if (!window.indexData?.sort_types) {
        select.innerHTML += '<option value="" disabled>⚠️ Сортаменты не загружены</option>';
        return;
    }

    // Получаем сортаменты в порядке приоритета из sort_priority
    const sortPriority = window.indexData.sort_priority || [];
    const allSorts = window.indexData.sort_types;

    // Сначала добавляем сортаменты в порядке приоритета
    const prioritySorts = [];
    const otherSorts = [];

    Object.entries(allSorts).forEach(([key, name]) => {
        const priorityIndex = sortPriority.indexOf(key);
        if (priorityIndex !== -1) {
            prioritySorts.push({
                key,
                name,
                priority: priorityIndex
            });
        } else {
            otherSorts.push({
                key,
                name,
                priority: 999
            });
        }
    });

    // Сортируем приоритетные по порядку
    prioritySorts.sort((a, b) => a.priority - b.priority);

    // Сортируем остальные по алфавиту
    otherSorts.sort((a, b) => a.name.localeCompare(b.name));

    // Объединяем
    const sortedSorts = [...prioritySorts, ...otherSorts];

    // Добавляем опции
    sortedSorts.forEach(sort => {
        const option = document.createElement('option');
        option.value = sort.key;
        option.textContent = sort.name;
        select.appendChild(option);
    });

    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
};

// ==========================================
// 📦 ФУНКЦИИ ДЛЯ ФИЛЬТРАЦИИ МАТЕРИАЛОВ
// ==========================================

/**
 * ЗАПОЛНЕНИЕ МАТЕРИАЛОВ ДЛЯ ВЫБРАННОГО СОРТАМЕНТА
 */
window.fillMaterialsForSort = function(sortType) {
    const materialSelect = document.getElementById('materialSelect');
    const currentValue = materialSelect.value;

    materialSelect.innerHTML = '<option value="">-- Выбери материал --</option>';
    materialSelect.disabled = true;

    // 1. Пробуем взять материалы из текущих данных сортамента
    const sortMaterials = window.currentSortData?.materials ?
        Object.keys(window.currentSortData.materials) : [];

    if (sortMaterials.length > 0) {
        // Заполняем из данных сортамента
        fillFromSortMaterials(sortMaterials, currentValue, sortType);
    } else {
        // Заполняем из общего списка
        fillFromDefaultListWithStrictFilter(sortType, currentValue);
    }
};

/**
 * ЗАПОЛНЯЕМ ТОЛЬКО МАТЕРИАЛЫ ИЗ ДАННЫХ СОРТАМЕНТА
 */
function fillFromSortMaterials(sortMaterials, currentValue, sortType) {
    const materialSelect = document.getElementById('materialSelect');
    const availableMaterials = [];

    const materialPriority = window.blackMetals.material_priority || [];

    if (materialPriority.length > 0) {
        materialPriority.forEach(materialKey => {
            const materialData = window.blackMetals[materialKey];
            if (materialData && materialData.наименование && sortMaterials.includes(materialKey)) {
                availableMaterials.push({
                    key: materialKey,
                    name: materialData.наименование
                });
            }
        });
    } else {
        for (const [materialKey, materialData] of Object.entries(window.blackMetals)) {
            if (typeof materialData === 'object' && materialData && materialData.наименование &&
                sortMaterials.includes(materialKey)) {
                availableMaterials.push({
                    key: materialKey,
                    name: materialData.наименование
                });
            }
        }
    }

    if (availableMaterials.length === 0) {
        fillFromDefaultListWithStrictFilter(sortType, currentValue);
        return;
    }

    availableMaterials.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat.key;
        option.textContent = mat.name;
        materialSelect.appendChild(option);
    });

    if (currentValue && availableMaterials.some(m => m.key === currentValue)) {
        materialSelect.value = currentValue;
    }

    materialSelect.disabled = false;
}

/**
 * ЗАПОЛНЯЕМ ИЗ ОБЩЕГО СПИСКА С ФИЛЬТРАЦИЕЙ
 */
function fillFromDefaultListWithStrictFilter(sortType, currentValue) {
    const materialSelect = document.getElementById('materialSelect');

    if (!window.blackMetals) {
        materialSelect.innerHTML = '<option value="" disabled>⚠️ Данные не загружены</option>';
        return;
    }

    const materialPriority = window.blackMetals.material_priority || [];
    const availableMaterials = [];

    if (materialPriority.length > 0) {
        materialPriority.forEach(materialKey => {
            const materialData = window.blackMetals[materialKey];
            if (materialData && materialData.наименование &&
                materialData.default_sort_types &&
                materialData.default_sort_types.includes(sortType)) {
                availableMaterials.push({
                    key: materialKey,
                    name: materialData.наименование
                });
            }
        });
    } else {
        for (const [materialKey, materialData] of Object.entries(window.blackMetals)) {
            if (typeof materialData === 'object' && materialData && materialData.наименование &&
                materialData.default_sort_types &&
                materialData.default_sort_types.includes(sortType)) {
                availableMaterials.push({
                    key: materialKey,
                    name: materialData.наименование
                });
            }
        }
    }

    if (availableMaterials.length === 0) {
        materialSelect.innerHTML = '<option value="" disabled>⚠️ Нет доступных материалов для этого сортамента</option>';
        materialSelect.disabled = true;
        return;
    }

    availableMaterials.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat.key;
        option.textContent = mat.name;
        materialSelect.appendChild(option);
    });

    if (currentValue && availableMaterials.some(m => m.key === currentValue)) {
        materialSelect.value = currentValue;
    }

    materialSelect.disabled = false;
}

// ==========================================
// 🚀 ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ
// ==========================================

/**
 * ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ПОСЛЕ ЗАГРУЗКИ ДАННЫХ
 */
window.initializeSystemAfterDataLoad = function() {
    console.log('✅ Система инициализирована');

    // 1. Проверяем что все модули загружены
    checkModules();

    // 2. Настраиваем переключатель режима
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    if (modeRadios.length > 0) {
        modeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (typeof window.changeMode === 'function') {
                    window.changeMode(this.value);
                } else {
                    console.error('❌ Функция changeMode не загружена');
                    alert('Ошибка: модуль переключения режима не загружен');
                }
            });
        });
    } else {
        console.error('❌ Переключатель режима не найден');
    }

    // 3. Заполняем выпадающие списки
    window.fillMaterialSelect();
    window.fillSortSelect();

    // 4. Инициализируем в режиме "от материала"
    if (typeof window.rebuildInterfaceForMode === 'function') {
        window.rebuildInterfaceForMode('material_first');
    } else {
        // Пробуем вручную настроить интерфейс
        const materialStep = document.querySelector('.step:nth-child(3)');
        const sortStep = document.querySelector('.step:nth-child(4)');

        if (materialStep && sortStep) {
            materialStep.querySelector('h3').textContent = '1. Выбери материал:';
            sortStep.querySelector('h3').textContent = '2. Выбери сортамент:';
        }
    }
};

/**
 * ПРОВЕРКА ЗАГРУЗКИ МОДУЛЕЙ
 */
function checkModules() {
    const modules = {
        'selection-mode.js (режимы)': ['changeMode', 'rebuildInterfaceForMode', 'setupMaterialFirstMode', 'setupSortFirstMode'],
        'material-logic.js (материалы)': ['updateSortsForMaterial'],
        'ui-helpers.js (интерфейс)': ['addSelectField', 'addGenerateButton', 'showDesignationResult'],
        'clipboard.js (буфер)': ['copyToClipboard'],
        'app-core.js (ядро)': ['getMaterialStandard', 'fillMaterialSelect', 'fillSortSelect', 'fillMaterialsForSort']
    };

    for (const [moduleName, functions] of Object.entries(modules)) {
        const missing = functions.filter(func => typeof window[func] !== 'function');
        if (missing.length > 0) {
            console.error(`❌ ${moduleName}: отсутствуют функции: ${missing.join(', ')}`);
        }
    }
}

/**
 * ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
 */
if (typeof window.updateSortsForMaterial !== 'function') {
    window.updateSortsForMaterial = function(materialKey) {
        console.error('❌ Функция updateSortsForMaterial не реализована');
    };
}

window.fillFromSortMaterials = fillFromSortMaterials;
window.fillFromDefaultListWithStrictFilter = fillFromDefaultListWithStrictFilter;

if (typeof window.changeMode !== 'function') {
    window.changeMode = function(mode) {
        alert('Модуль режимов не загружен. Перезагрузите страницу.');
    };
}

if (typeof window.rebuildInterfaceForMode !== 'function') {
    window.rebuildInterfaceForMode = function(mode) {
        const materialStep = document.querySelector('.step:nth-child(3)');
        const sortStep = document.querySelector('.step:nth-child(4)');

        if (materialStep && sortStep) {
            if (mode === 'material_first') {
                materialStep.querySelector('h3').textContent = '1. Выбери материал:';
                sortStep.querySelector('h3').textContent = '2. Выбери сортамент:';
            } else {
                materialStep.querySelector('h3').textContent = '2. Выбери материал:';
                sortStep.querySelector('h3').textContent = '1. Выбери сортамент:';
            }
        }
    };
}