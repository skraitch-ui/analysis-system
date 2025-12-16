// round_bar_forged.js - МОДУЛЬ ДЛЯ ПРУТКА КРУГЛОГО КОВАНОГО
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ КОВАНОГО ПРУТКА
// ==========================================

const roundBarForgedModule = {
    sortType: 'round_bar_forged',

    showParameters: function() {
        console.log('🎯 [round_bar_forged.js] showParameters вызван');

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
        if (!materialData || !materialData.diameters_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по диаметрам для этого материала</div>';
            return;
        }

        // 4. Диаметр прутка
        const diameters = materialData.diameters_mm;
        console.log('📏 Диаметры для материала', materialKey, ':', diameters);

        const diameterDiv = document.createElement('div');
        diameterDiv.className = 'param-group';
        diameterDiv.innerHTML = `
            <label>Диаметр прутка (мм):</label>
            <select class="diameter-select param-select">
                <option value="">-- Выбери диаметр --</option>
                ${diameters.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(diameterDiv);

        // 5. Информация о состоянии поставки
        const deliveryCondition = materialData.delivery_condition;
        if (deliveryCondition) {
            const deliveryDiv = document.createElement('div');
            deliveryDiv.className = 'param-group';
            deliveryDiv.innerHTML = `
                <label>Состояние поставки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${deliveryCondition}</strong>
                    <br><small style="color: #666;">(кованый прокат по ГОСТ 1133-71)</small>
                </div>
            `;
            paramsContent.appendChild(deliveryDiv);
        }

        // 6. Информация о стандарте
        const standardInfo = document.createElement('div');
        standardInfo.className = 'param-group';
        standardInfo.innerHTML = `
            <label>Стандарт на изделие:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${window.currentSortData.standard || 'ГОСТ 1133-71'}</strong>
                <br><small style="color: #666;">(Прутки круглые кованые)</small>
            </div>
        `;
        paramsContent.appendChild(standardInfo);

        // 7. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение прутка';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 8. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры кованого прутка отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [round_bar_forged.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const diameter = document.querySelector('.diameter-select')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем обязательные поля
        if (!diameter) {
            alert('❌ Выбери диаметр прутка!');
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

        // 4. Формируем обозначение
        try {
            // Стандарт материала
            const materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // 5. Формируем числитель и знаменатель
            let numerator = window.currentSortData.designation_components.numerator
                .replace(/{diameter}/g, diameter)
                .replace(/{standard}/g, window.currentSortData.standard || '');

            let denominator = window.currentSortData.designation_components.denominator
                .replace(/{material}/g, materialKey)
                .replace(/{material_standard}/g, materialStandard);

            // 6. Очистка и форматирование
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            // 7. Полное обозначение
            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации:', {
                materialKey,
                diameter,
                materialStandard,
                numerator,
                denominator,
                fullDesignation
            });

            // 8. Показываем результат (дробный формат)
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Круг',
                    numerator,
                    denominator,
                    fullDesignation
                );
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

if (!window.sortModules) window.sortModules = {};
window.sortModules['round_bar_forged'] = roundBarForgedModule;