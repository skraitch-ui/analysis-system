// tube-round.js - МОДУЛЬ ДЛЯ ТРУБЫ КРУГЛОЙ (ПЕРЕДЕЛАННЫЙ)
// ==========================================

const TubeRoundModule = {
    sortType: 'tube_round',

    showParameters: function() {
        console.log('🎯 [tube-round.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        // Очищаем контейнер
        paramsContent.innerHTML = '';

        // 1. Проверяем что данные сортамента загружены
        if (!window.currentSortData || Object.keys(window.currentSortData).length === 0) {
            console.error('❌ Данные сортамента не загружены');
            paramsContent.innerHTML = '<div class="error">⚠️ Данные сортамента не загружены. Попробуйте выбрать снова.</div>';
            return;
        }

        // 2. Получаем выбранный материал
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        // 3. Проверяем что материал есть в данных сортамента
        const materialData = window.currentSortData.materials?.[materialKey];
        if (!materialData || !materialData.sizes_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по размерам труб для этого материала</div>';
            return;
        }

        console.log('📦 Данные материала для tube_round:', materialData);

        // 4. Диаметр трубы
        const diameters = [...new Set(materialData.sizes_mm.map(size => size.diameter))];
        console.log('📏 Диаметры для материала', materialKey, ':', diameters);

        // Создаем select для диаметра
        const diameterDiv = document.createElement('div');
        diameterDiv.className = 'param-group';
        diameterDiv.innerHTML = `
            <label>Наружный диаметр (мм):</label>
            <select class="tube-diameter param-select">
                <option value="">-- Выбери диаметр --</option>
                ${diameters.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(diameterDiv);

        const diameterSelect = paramsContent.querySelector('.tube-diameter');

        // 5. Толщина стенки (зависит от диаметра)
        const wallDiv = document.createElement('div');
        wallDiv.className = 'param-group';
        wallDiv.innerHTML = `
            <label>Толщина стенки (мм):</label>
            <select class="tube-wall param-select" disabled>
                <option value="">-- Сначала выбери диаметр --</option>
            </select>
        `;
        paramsContent.appendChild(wallDiv);

        const wallSelect = paramsContent.querySelector('.tube-wall');

        // Обработчик изменения диаметра
        diameterSelect.addEventListener('change', function() {
            const selectedDiameter = this.value;
            wallSelect.innerHTML = '<option value="">-- Выбери толщину стенки --</option>';
            wallSelect.disabled = !selectedDiameter;

            if (selectedDiameter) {
                // Находим все толщины для выбранного диаметра
                const walls = materialData.sizes_mm
                    .filter(size => size.diameter === selectedDiameter)
                    .map(size => size.wall);

                walls.forEach(wall => {
                    const option = document.createElement('option');
                    option.value = wall;
                    option.textContent = wall;
                    wallSelect.appendChild(option);
                });
            }
        });

        // 6. Информация о стандарте (если есть у материала)
        const materialStandard = materialData.material_standard;
        if (materialStandard) {
            const standardInfo = document.createElement('div');
            standardInfo.className = 'param-group';
            standardInfo.innerHTML = `
                <label>Стандарт на материал:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${materialStandard}</strong>
                </div>
            `;
            paramsContent.appendChild(standardInfo);
        }

        // 7. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение трубы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 8. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры круглой трубы отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [tube-round.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const diameter = document.querySelector('.tube-diameter')?.value;
        const wall = document.querySelector('.tube-wall')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
        if (!diameter || !wall) {
            alert('❌ Выбери диаметр и толщину стенки трубы!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // 3. Получаем данные материала
        const materialData = window.currentSortData?.materials?.[materialKey];
        if (!materialData) {
            alert('❌ Нет данных для выбранного материала!');
            return;
        }

        // 4. Формируем компоненты обозначения
        try {
            // 4.1 Определяем product_name (Труба/Трубка) через size_product_map
            let productName = window.currentSortData.product_name || 'Труба';
            let standard = materialData.standard || window.currentSortData.standard;

            const sizeKey = `${diameter}*${wall}`;
            if (window.currentSortData.size_product_map) {
                if (window.currentSortData.size_product_map[sizeKey]) {
                    productName = window.currentSortData.size_product_map[sizeKey].product_name;
                    standard = window.currentSortData.size_product_map[sizeKey].standard || standard;
                } else if (window.currentSortData.size_product_map.default) {
                    productName = window.currentSortData.size_product_map.default.product_name;
                    standard = window.currentSortData.size_product_map.default.standard || standard;
                }
            }

            console.log('📊 Определено:', { productName, standard, sizeKey });

            // 4.2 Определяем стандарт материала
            // Сначала проверяем material_standard в данных материала
            let materialStandard = materialData.material_standard;

            // Если нет в материале, используем общую логику
            if (!materialStandard) {
                // Проверяем material_standard_logic в сортаменте
                if (window.currentSortData.material_standard_logic?.[materialKey]) {
                    materialStandard = window.currentSortData.material_standard_logic[materialKey];
                } else {
                    // Используем глобальную функцию
                    materialStandard = window.getMaterialStandard(materialKey, this.sortType);
                }
            }

            console.log('📊 Стандарт материала:', materialStandard);

            // 4.3 Формируем обозначение
            let numerator = '', denominator = '', fullDesignation = '';
            let useSpecialFormat = false;

            // Проверяем есть ли особый example_designation у материала
            if (materialData.example_designation && !materialData.designation_components) {
                console.log('🔧 Используем особый формат обозначения (без дроби)');

                // Используем специальный формат обозначения
                fullDesignation = materialData.example_designation
                    .replace(/{product_name}/g, productName)
                    .replace(/{diameter}/g, diameter)
                    .replace(/{wall}/g, wall)
                    .replace(/{material}/g, materialKey)
                    .replace(/{standard}/g, standard || 'ГОСТ не указан')
                    .trim();

                // Для особого формата передаем:
                // - productName: как обычно
                // - numerator: часть после названия (или пустая)
                // - denominator: ПУСТАЯ строка (это важно!)
                // - fullDesignation: полное обозначение

                // Можно либо передать пустой numerator, либо часть после productName
                const displayPart = fullDesignation.startsWith(productName + ' ')
                    ? fullDesignation.substring(productName.length + 1)
                    : fullDesignation;

                numerator = displayPart;
                denominator = ''; // ПУСТОЙ знаменатель - это ключевой момент!

                console.log('📊 Особый формат:', { fullDesignation, numerator, denominator });
            }
            else if (materialData.designation_components) {
                console.log('🔧 Используем designation_components из материала');
                useSpecialFormat = false;

                // Используем components из данных материала
                numerator = materialData.designation_components.numerator
                    .replace(/{diameter}/g, diameter)
                    .replace(/{wall}/g, wall)
                    .replace(/{standard}/g, standard || 'ГОСТ не указан')
                    .trim();

                // Если materialStandard не определен, используем запасной вариант
                if (!materialStandard) {
                    materialStandard = window.getMaterialStandard(materialKey, this.sortType);
                }

                denominator = materialData.designation_components.denominator
                    .replace(/{material}/g, materialKey)
                    .replace(/{material_standard}/g, materialStandard)
                    .trim();

                // Если denominator пустой после замены, добавляем материал и стандарт
                if (!denominator.trim()) {
                    denominator = `${materialKey} ${materialStandard}`.trim();
                }

                fullDesignation = `${productName} ${numerator}/${denominator}`.trim();
            }
            else {
                console.log('🔧 Используем резервный вариант');
                useSpecialFormat = false;

                // Резервный вариант
                numerator = `${diameter}*${wall} ${standard || 'ГОСТ не указан'}`.trim();

                // Если materialStandard не определен, используем запасной вариант
                if (!materialStandard) {
                    materialStandard = window.getMaterialStandard(materialKey, this.sortType);
                }

                denominator = `${materialKey} ${materialStandard}`.trim();
                fullDesignation = `${productName} ${numerator}/${denominator}`.trim();
            }

            // 5. Очистка и форматирование
            numerator = numerator.trim().replace(/\s+/g, ' ');

            // Для особого формата не очищаем denominator (он пустой)
            if (!useSpecialFormat) {
                denominator = denominator.trim().replace(/\s+/g, ' ');
            }

            fullDesignation = fullDesignation.trim().replace(/\s+/g, ' ');

            // Убираем двойные пробелы
            numerator = numerator.replace(/\s{2,}/g, ' ');
            if (!useSpecialFormat) {
                denominator = denominator.replace(/\s{2,}/g, ' ');
            }
            fullDesignation = fullDesignation.replace(/\s{2,}/g, ' ');

            console.log('📝 Результат генерации:', {
                materialKey,
                diameter,
                wall,
                sizeKey,
                productName,
                standard,
                materialStandard,
                numerator,
                denominator: useSpecialFormat ? '(пусто для особого формата)' : denominator,
                fullDesignation,
                useSpecialFormat
            });

            // 6. Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                if (useSpecialFormat) {
                    // Для особого формата передаем пустой знаменатель
                    window.showDesignationResult(
                        productName,
                        numerator,
                        '', // пустой знаменатель
                        fullDesignation
                    );
                } else {
                    window.showDesignationResult(
                        productName,
                        numerator,
                        denominator,
                        fullDesignation
                    );
                }
            } else {
                console.error('❌ Функция showDesignationResult не найдена!');
                alert('Ошибка: не удалось отобразить результат');
            }

        } catch (error) {
            console.error('❌ Ошибка генерации обозначения:', error);
            alert('Ошибка при генерации обозначения. Проверьте данные.');
        }
    }
};


// ==========================================
// 📦 РЕГИСТРАЦИЯ МОДУЛЯ
// ==========================================

window.sortModules = window.sortModules || {};
window.sortModules['tube_round'] = TubeRoundModule;