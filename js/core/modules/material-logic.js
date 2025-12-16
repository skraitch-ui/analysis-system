// core/modules/material-logic.js
// ==========================================
// 📦 ЛОГИКА РАБОТЫ С МАТЕРИАЛАМИ И СОРТАМЕНТАМИ
// ==========================================

/**
 * ОБНОВЛЕНИЕ ДОСТУПНЫХ СОРТАМЕНТОВ ДЛЯ МАТЕРИАЛА
 */
function updateSortsForMaterial(materialKey) {
    const sortSelect = document.getElementById('sortSelect');
    const material = window.blackMetals?.[materialKey];

    if (!material) {
        sortSelect.disabled = true;
        sortSelect.innerHTML = '<option value="">⚠️ Ошибка загрузки материала</option>';
        return;
    }

    const currentValue = sortSelect.value;
    sortSelect.innerHTML = '<option value="">-- Выбери сортамент --</option>';
    sortSelect.disabled = false;

    // ЕСЛИ У МАТЕРИАЛА НЕТ default_sort_types ИЛИ ОНИ ПУСТЫЕ
    if (!material.default_sort_types || material.default_sort_types.length === 0) {
        console.log(`⚠️ У материала ${materialKey} нет default_sort_types`);
        sortSelect.innerHTML = '<option value="" disabled>⚠️ Нет доступных сортаментов для этого материала</option>';
        sortSelect.disabled = true;
        return;
    }

    // ЕСЛИ ТОЛЬКО ОДИН СОРТАМЕНТ - ВЫБИРАЕМ АВТОМАТИЧЕСКИ
    if (material.default_sort_types.length === 1) {
        const singleSortType = material.default_sort_types[0];
        const russianName = window.indexData?.sort_types?.[singleSortType] || singleSortType;

        const option = document.createElement('option');
        option.value = singleSortType;
        option.textContent = russianName;
        option.selected = true;
        sortSelect.appendChild(option);

        console.log(`✅ Автовыбор: материал ${materialKey} → ${singleSortType}`);

        // Автоматически загружаем данные сортамента
        setTimeout(() => {
            if (typeof window.loadSortData === 'function') {
                window.loadSortData(singleSortType);
            }
        }, 100);

        return;
    }

    // ЕСЛИ НЕСКОЛЬКО СОРТАМЕНТОВ - ПОКАЗЫВАЕМ СПИСОК
    const availableSorts = [];

    // ПРОВЕРЯЕМ КАЖДЫЙ СОРТАМЕНТ: есть ли он в index.json?
    material.default_sort_types.forEach(sortType => {
        // 1. Проверяем что сортамент существует в index.json
        const russianName = window.indexData?.sort_types?.[sortType];
        if (russianName) {
            availableSorts.push({
                type: sortType,
                name: russianName,
                priority: window.indexData?.sort_priority?.indexOf(sortType) ?? 999
            });
        } else {
            console.warn(`⚠️ Сортамент ${sortType} есть у материала ${materialKey}, но нет в index.json!`);
        }
    });

    // ЕСЛИ НИЧЕГО НЕ НАШЛИ
    if (availableSorts.length === 0) {
        sortSelect.innerHTML = '<option value="" disabled>⚠️ Нет доступных сортаментов</option>';
        sortSelect.disabled = true;
        return;
    }

    // СОРТИРОВКА ПО ПРИОРИТЕТУ
    availableSorts.sort((a, b) => {
        if (a.priority !== b.priority) {
            return a.priority - b.priority; // Меньше число = выше приоритет
        }
        return a.name.localeCompare(b.name);
    });

    availableSorts.forEach(sort => {
        const option = document.createElement('option');
        option.value = sort.type;
        option.textContent = sort.name;
        sortSelect.appendChild(option);
    });

    if (currentValue && availableSorts.some(s => s.type === currentValue)) {
        sortSelect.value = currentValue;
    }

    console.log('✅ Доступных сортаментов:', availableSorts.length);
    console.log('📊 Сортаменты для материала', materialKey, ':', availableSorts.map(s => s.type));
}

// Экспортируем в глобальную область
window.updateSortsForMaterial = updateSortsForMaterial;