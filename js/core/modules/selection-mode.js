// core/modules/selection-mode.js
// ==========================================

window.selectionMode = 'material_first';
let eventListenersInitialized = false; // Флаг чтобы инициализировать обработчики только один раз

/**
 * ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ВЫБОРА
 */
window.changeMode = function(mode) {
    window.selectionMode = mode;

    // Скрываем параметры и результат
    const paramsContainer = document.getElementById('paramsContainer');
    const resultContainer = document.getElementById('resultContainer');

    if (paramsContainer) paramsContainer.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';

    // Перестраиваем интерфейс
    rebuildInterfaceForMode(mode);
};

/**
 * ПЕРЕСТРОЙКА ИНТЕРФЕЙСА ПОД ВЫБРАННЫЙ РЕЖИМ
 */
window.rebuildInterfaceForMode = function(mode) {
    const materialStep = document.querySelector('.step:nth-child(3)');
    const sortStep = document.querySelector('.step:nth-child(4)');

    if (!materialStep || !sortStep) {
        console.error('❌ Не найдены шаги выбора');
        return;
    }

    if (mode === 'material_first') {
        materialStep.querySelector('h3').textContent = '1. Выбери материал:';
        sortStep.querySelector('h3').textContent = '2. Выбери сортамент:';
        setupMaterialFirstMode();
    } else {
        materialStep.querySelector('h3').textContent = '2. Выбери материал:';
        sortStep.querySelector('h3').textContent = '1. Выбери сортамент:';
        setupSortFirstMode();
    }
};

/**
 * НАСТРОЙКА РЕЖИМА "ОТ МАТЕРИАЛА"
 */
window.setupMaterialFirstMode = function() {
    const materialSelect = document.getElementById('materialSelect');
    const sortSelect = document.getElementById('sortSelect');

    // Заполняем списки если нужно
    if (materialSelect.options.length <= 1) window.fillMaterialSelect();
    if (sortSelect.options.length <= 1) window.fillSortSelect();

    // ИНИЦИАЛИЗИРУЕМ ОБРАБОТЧИКИ ТОЛЬКО ОДИН РАЗ
    if (!eventListenersInitialized) {
        // Обработчик материала
        materialSelect.onchange = function() {
            const materialKey = this.value;

            if (!materialKey) {
                sortSelect.disabled = true;
                sortSelect.innerHTML = '<option value="">-- Сначала выбери материал --</option>';
                return;
            }

            // Обновляем доступные сортаменты
            if (typeof window.updateSortsForMaterial === 'function') {
                window.updateSortsForMaterial(materialKey);
            }

            // Если уже есть выбранный сортамент, загружаем его данные
            if (sortSelect.value && typeof window.loadSortData === 'function') {
                window.loadSortData(sortSelect.value);
            }
        };

        // Обработчик сортамента
        sortSelect.onchange = function() {
            const sortType = this.value;

            if (sortType && typeof window.loadSortData === 'function') {
                window.loadSortData(sortType);
            }
        };

        eventListenersInitialized = true;
    }

    // Сначала оба доступны
    materialSelect.disabled = false;
    sortSelect.disabled = false;

    // Инициализируем если уже есть выбранный материал
    if (materialSelect.value && typeof window.updateSortsForMaterial === 'function') {
        window.updateSortsForMaterial(materialSelect.value);
    } else {
        sortSelect.disabled = true;
        sortSelect.innerHTML = '<option value="">-- Сначала выбери материал --</option>';
    }
};

/**
 * НАСТРОЙКА РЕЖИМА "ОТ СОРТАМЕНТА"
 */
window.setupSortFirstMode = function() {
    const materialSelect = document.getElementById('materialSelect');
    const sortSelect = document.getElementById('sortSelect');

    // Заполняем списки если нужно
    if (sortSelect.options.length <= 1 && typeof window.fillSortSelect === 'function') {
        window.fillSortSelect();
    }

    if (materialSelect.options.length <= 1 && typeof window.fillMaterialSelect === 'function') {
        window.fillMaterialSelect();
    }

    // Сортамент доступен сразу
    sortSelect.disabled = false;

    // Материал заблокирован до выбора сортамента
    materialSelect.disabled = true;
    materialSelect.innerHTML = '<option value="">-- Сначала выбери сортамент --</option>';

    // ИНИЦИАЛИЗИРУЕМ ОБРАБОТЧИКИ ТОЛЬКО ОДИН РАЗ
    if (!eventListenersInitialized) {
        // Обработчик сортамента
        sortSelect.onchange = function() {
            const sortType = this.value;

            if (!sortType) {
                materialSelect.disabled = true;
                materialSelect.innerHTML = '<option value="">-- Сначала выбери сортамент --</option>';
                return;
            }

            // Загружаем данные сортамента
            if (typeof window.loadSortData === 'function') {
                window.loadSortData(sortType).then(() => {
                    // После загрузки заполняем материалы
                    if (typeof window.fillMaterialsForSort === 'function') {
                        window.fillMaterialsForSort(sortType);
                    }

                    // Если уже есть выбранный материал, сразу показываем параметры
                    const currentMaterial = materialSelect.value;
                    if (currentMaterial && window.sortModules && window.sortModules[sortType] && window.sortModules[sortType].showParameters) {
                        window.sortModules[sortType].showParameters();
                    }
                });
            }
        };

        // Обработчик материала
        materialSelect.onchange = function() {
            const materialKey = this.value;
            const sortType = sortSelect.value;

            if (materialKey && sortType) {
                // Показываем параметры для выбранного материала
                if (window.sortModules && window.sortModules[sortType] && window.sortModules[sortType].showParameters) {
                    window.sortModules[sortType].showParameters();
                }
            }
        };

        eventListenersInitialized = true;
    }

    // Если уже есть выбранный сортамент, обновляем материалы
    if (sortSelect.value) {
        if (typeof window.fillMaterialsForSort === 'function') {
            window.fillMaterialsForSort(sortSelect.value);
        }
    }
};