// hex_bar.js - МОДУЛЬ ДЛЯ ШЕСТИГРАННИКА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ШЕСТИГРАННОГО ПРУТКА
// ==========================================

const hexBarModule = {
    sortType: 'hex_bar',

    showParameters: function() {
        console.log('🎯 [hex_bar.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        paramsContent.innerHTML = '';

        // Проверка данных
        if (!window.currentSortData || Object.keys(window.currentSortData).length === 0) {
            paramsContent.innerHTML = '<div class="error">⚠️ Данные сортамента не загружены</div>';
            return;
        }

        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        const materialData = window.currentSortData.materials?.[materialKey];
        if (!materialData || !materialData.sizes_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по размерам для этого материала</div>';
            return;
        }

        // Шестигранник: массив размеров
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры шестигранника для материала', materialKey, ':', sizes);

        // Определяем состояние поставки для каждого размера
        const sizeOptions = sizes.map(size => {
            let deliveryCondition = materialData.delivery_condition;

            // Проверяем size_delivery_map
            if (materialData.size_delivery_map && materialData.size_delivery_map[size]) {
                deliveryCondition = materialData.size_delivery_map[size].delivery_condition;
            }

            return {
                size,
                deliveryCondition,
                display: `${size} мм (${deliveryCondition})`
            };
        });

        // Выбор размера
        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер шестигранника (мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizeOptions.map(opt =>
                    `<option value='${JSON.stringify(opt)}'>${opt.display}</option>`
                ).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Выбор класса точности
        if (materialData.accuracy_classes && materialData.accuracy_classes.length > 0) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'param-group';
            accuracyDiv.innerHTML = `
                <label>Класс точности:</label>
                <select class="accuracy-select param-select">
                    <option value="">-- Выбери класс точности --</option>
                    ${materialData.accuracy_classes.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            `;
            paramsContent.appendChild(accuracyDiv);
        }

        // Информация о термообработке (определяется автоматически)
        const heatInfo = document.createElement('div');
        heatInfo.className = 'param-group';
        heatInfo.innerHTML = `
            <label>Информация:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>Состояние поставки и стандарт</strong> определяются автоматически<br>
                в зависимости от выбранного размера и материала
            </div>
        `;
        paramsContent.appendChild(heatInfo);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение шестигранника';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры шестигранника отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [hex_bar.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const accuracySelect = document.querySelector('.accuracy-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер шестигранника!');
            return;
        }

        if (!accuracySelect || !accuracySelect.value) {
            alert('❌ Выбери класс точности!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Парсим выбранный размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { size, deliveryCondition } = sizeData;
            const accuracy = accuracySelect.value;

            // Определяем суффикс термообработки
            const heatSuffix = window.currentSortData.heat_treatment_logic?.[deliveryCondition] || '';

            // Определяем стандарт сортамента
            const standard = window.currentSortData.standard_logic?.[deliveryCondition] || 'ГОСТ';

            // Определяем стандарт материала
            let materialStandard = window.currentSortData.material_standard_logic?.[deliveryCondition];
            if (!materialStandard) {
                materialStandard = window.getMaterialStandard(materialKey, this.sortType);
            }

            // Формируем обозначение
            // numerator: "{size}-{accuracy} {standard}"
            // denominator: "{material}{heat_treatment_suffix} {material_standard}"

            let numerator = window.currentSortData.designation_components?.numerator
                .replace('{size}', size)
                .replace('{accuracy}', accuracy)
                .replace('{standard}', standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace('{material}', materialKey)
                .replace('{heat_treatment_suffix}', heatSuffix)
                .replace('{material_standard}', materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации шестигранника:', {
                size, deliveryCondition, accuracy, heatSuffix,
                standard, materialStandard, numerator, denominator, fullDesignation
            });

            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name,
                    numerator,
                    denominator,
                    fullDesignation
                );
            }

        } catch (error) {
            console.error('❌ Ошибка генерации шестигранника:', error);
            alert('Ошибка при генерации обозначения шестигранника');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['hex_bar'] = hexBarModule;