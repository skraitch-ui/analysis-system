// strip.js - МОДУЛЬ ДЛЯ ПОЛОСЫ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ПОЛОСЫ
// ==========================================

const stripModule = {
    sortType: 'strip',

    showParameters: function() {
        console.log('🎯 [strip.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        paramsContent.innerHTML = '';

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
            paramsContent.innerHTML = '<div class="error">❌ Нет данных для этого материала</div>';
            return;
        }

        console.log('📊 Материал для полосы:', materialKey, materialData);

        // Полоса: массив объектов с thickness и width
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры полосы для материала', materialKey, ':', sizes);

        // Создаем варианты размеров
        const sizeOptions = sizes.map(s => ({
            display: `${s.thickness}×${s.width}`,
            value: JSON.stringify(s)
        }));

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер полосы (толщина×ширина, мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizeOptions.map(opt => `<option value='${opt.value}'>${opt.display}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Выбор класса точности (если есть у материала)
        const accuracyClasses = materialData.accuracy_classes || [];

        if (accuracyClasses.length > 0) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'param-group';
            accuracyDiv.innerHTML = `
                <label>Класс точности прокатки:</label>
                <select class="accuracy-select param-select">
                    <option value="">-- Выбери класс точности --</option>
                    ${accuracyClasses.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            `;
            paramsContent.appendChild(accuracyDiv);
        } else {
            // Информация о том, что класс точности не требуется
            const accuracyInfo = document.createElement('div');
            accuracyInfo.className = 'param-group';
            accuracyInfo.innerHTML = `
                <label>Класс точности:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>Не нормируется</strong>
                    <br><small style="color: #666;">(для этого материала)</small>
                </div>
            `;
            paramsContent.appendChild(accuracyInfo);
        }

        // Информация о состоянии поставки и термообработке
        const deliveryDiv = document.createElement('div');
        deliveryDiv.className = 'param-group';
        deliveryDiv.innerHTML = `
            <label>Состояние поставки:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${materialData.delivery_condition}</strong><br>
                <small style="color: #666;">Стандарт: ${materialData.standard || 'ГОСТ'}</small>
            </div>
        `;
        paramsContent.appendChild(deliveryDiv);

        // Информация о суффиксе термообработки
        const heatSuffix = window.currentSortData.heat_treatment_logic?.[materialData.delivery_condition] || '';
        if (heatSuffix) {
            const heatDiv = document.createElement('div');
            heatDiv.className = 'param-group';
            heatDiv.innerHTML = `
                <label>Суффикс термообработки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${heatSuffix}</strong>
                    <br><small style="color: #666;">(определяется автоматически)</small>
                </div>
            `;
            paramsContent.appendChild(heatDiv);
        }

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение полосы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры полосы отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [strip.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const accuracySelect = document.querySelector('.accuracy-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер полосы!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            const materialData = window.currentSortData.materials?.[materialKey];
            if (!materialData) {
                alert('❌ Нет данных для выбранного материала!');
                return;
            }

            // Парсим размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { thickness, width } = sizeData;

            const accuracy = accuracySelect?.value || '';
            const deliveryCondition = materialData.delivery_condition;
            const heatSuffix = window.currentSortData.heat_treatment_logic?.[deliveryCondition] || '';

            // У полосы у каждого материала СВОИ designation_components!
            const designationComponents = materialData.designation_components;
            if (!designationComponents) {
                alert('❌ Нет данных для формирования обозначения!');
                return;
            }

            // Стандарт материала берём из данных материала
            const materialStandard = materialData.material_standard ||
                                   window.getMaterialStandard(materialKey, this.sortType);

            // Стандарт сортамента берём из данных материала
            const standard = materialData.standard || window.currentSortData.standard || 'ГОСТ';

            // Формируем обозначение из компонентов материала
            let numerator = designationComponents.numerator
                .replace('{accuracy}', accuracy)
                .replace('{thickness}', thickness)
                .replace('{width}', width)
                .replace('{standard}', standard);

            let denominator = designationComponents.denominator
                .replace('{material}', materialKey)
                .replace('{heat_treatment_suffix}', heatSuffix)
                .replace('{material_standard}', materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            // Убираем "- " если accuracy пустой
            if (!accuracy && numerator.startsWith('- ')) {
                numerator = numerator.substring(2);
            }

            // Убираем двойные пробелы
            numerator = numerator.replace(/\s{2,}/g, ' ');
            denominator = denominator.replace(/\s{2,}/g, ' ');

            const fullDesignation = `${window.currentSortData.product_name || 'Полоса'} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации полосы:', {
                thickness, width, accuracy, materialKey, deliveryCondition,
                heatSuffix, standard, materialStandard,
                numerator, denominator, fullDesignation
            });

            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Полоса',
                    numerator,
                    denominator,
                    fullDesignation
                );
            }

        } catch (error) {
            console.error('❌ Ошибка генерации полосы:', error);
            alert('Ошибка при генерации обозначения полосы');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['strip'] = stripModule;