// angle.js - МОДУЛЬ ДЛЯ УГОЛКА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ УГОЛКА
// ==========================================

const angleModule = {
    sortType: 'angle',

    showParameters: function() {
        console.log('🎯 [angle.js] showParameters вызван');

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

        // Уголок: массив объектов с полями number, side, thickness
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры уголка для материала', materialKey, ':', sizes);

        // Создаем массив строк для отображения
        const sizeOptions = sizes.map(s => {
            return {
                display: `${s.side}×${s.side}×${s.thickness} (№${s.number})`,
                value: JSON.stringify(s) // Сохраняем как JSON
            };
        });

        // Выбор размера
        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер уголка (мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizeOptions.map(opt => `<option value='${opt.value}'>${opt.display}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Уголок имеет фиксированный класс точности "В"
        const accuracyInfo = document.createElement('div');
        accuracyInfo.className = 'param-group';
        accuracyInfo.innerHTML = `
            <label>Класс точности прокатки:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.accuracy || 'В'}</strong>
            </div>
        `;
        paramsContent.appendChild(accuracyInfo);

        // Категория качества
        const qualityInfo = document.createElement('div');
        qualityInfo.className = 'param-group';
        qualityInfo.innerHTML = `
            <label>Категория проката:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.quality_category || '5'}</strong>
            </div>
        `;
        paramsContent.appendChild(qualityInfo);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение уголка';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры уголка отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [angle.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер уголка!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Парсим выбранный размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { side, thickness } = sizeData;

            // Стандарт материала
            let materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // Формируем обозначение по шаблону из JSON
            // numerator: "{accuracy}-{side}*{side}*{thickness} {standard}"
            // denominator: "{material}{quality_category} {material_standard}"

            const accuracy = window.currentSortData.accuracy || 'В';
            const qualityCategory = window.currentSortData.quality_category || '5';
            const standard = window.currentSortData.standard || 'ГОСТ 8509-93';

            let numerator = window.currentSortData.designation_components?.numerator
                .replace(/{accuracy}/g, accuracy)           // g для всех вхождений
                .replace(/{side}/g, side)                   // g для всех вхождений
                .replace(/{thickness}/g, thickness)
                .replace(/{standard}/g, standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace(/{material}/g, materialKey)        // g для всех вхождений
                .replace(/{quality_category}/g, qualityCategory)
                .replace(/{material_standard}/g, materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации уголка:', {
                side, thickness, materialKey,
                accuracy, qualityCategory,
                numerator, denominator, fullDesignation
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
            console.error('❌ Ошибка генерации уголка:', error);
            alert('Ошибка при генерации обозначения уголка');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['angle'] = angleModule;