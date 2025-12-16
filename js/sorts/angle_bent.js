// angle_bent.js - МОДУЛЬ ДЛЯ УГОЛКА ГНУТОГО
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ УГОЛКА ГНУТОГО
// ==========================================

const angleBentModule = {
    sortType: 'angle_bent',

    showParameters: function() {
        console.log('🎯 [angle_bent.js] showParameters вызван');

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

        console.log('📊 Материал для уголка гнутого:', materialKey, materialData);

        // Уголок гнутый: массив объектов с side, thickness, radius
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры уголка гнутого для материала', materialKey, ':', sizes);

        // Создаем варианты размеров
        const sizeOptions = sizes.map(s => ({
            display: `${s.side}×${s.side}×${s.thickness} (R=${s.radius})`,
            value: JSON.stringify(s)
        }));

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер уголка (сторона×сторона×толщина, мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizeOptions.map(opt => `<option value='${opt.value}'>${opt.display}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Информация о точности профилирования
        const accuracyProfileInfo = document.createElement('div');
        accuracyProfileInfo.className = 'param-group';
        accuracyProfileInfo.innerHTML = `
            <label>Точность профилирования:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.accuracy_profile || 'В'}</strong>
                <br><small style="color: #666;">(обычная точность)</small>
            </div>
        `;
        paramsContent.appendChild(accuracyProfileInfo);

        // Информация о точности прокатки
        const accuracyRollingInfo = document.createElement('div');
        accuracyRollingInfo.className = 'param-group';
        accuracyRollingInfo.innerHTML = `
            <label>Точность прокатки:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.accuracy_rolling || 'Б'}</strong>
                <br><small style="color: #666;">(нормальная точность)</small>
            </div>
        `;
        paramsContent.appendChild(accuracyRollingInfo);

        // Информация о категории качества
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
        button.innerHTML = '🎯 Сгенерировать обозначение уголка гнутого';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры уголка гнутого отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [angle_bent.js] generateDesignation вызван');

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
            // Парсим размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { side, thickness } = sizeData;

            // Стандарт материала - ВСЕГДА через getMaterialStandard!
            const materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            const accuracyProfile = window.currentSortData.accuracy_profile || 'В';
            const accuracyRolling = window.currentSortData.accuracy_rolling || 'Б';
            const qualityCategory = window.currentSortData.quality_category || '5';
            const standard = window.currentSortData.standard || 'ГОСТ 19771-93';

            // Формируем обозначение С ФЛАГОМ 'g' для всех вхождений!
            let numerator = window.currentSortData.designation_components?.numerator
                .replace(/{accuracy_profile}/g, accuracyProfile)
                .replace(/{side}/g, side)  // g - заменит ВСЕ {side}!
                .replace(/{thickness}/g, thickness)
                .replace(/{accuracy_rolling}/g, accuracyRolling)
                .replace(/{standard}/g, standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace(/{quality_category}/g, qualityCategory)
                .replace(/{material}/g, materialKey)
                .replace(/{material_standard}/g, materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации уголка гнутого:', {
                side, thickness, materialKey, accuracyProfile, accuracyRolling,
                qualityCategory, standard, materialStandard,
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
            console.error('❌ Ошибка генерации уголка гнутого:', error);
            alert('Ошибка при генерации обозначения уголка гнутого');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['angle_bent'] = angleBentModule;