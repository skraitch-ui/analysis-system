// tube_square.js - МОДУЛЬ ДЛЯ КВАДРАТНОЙ ТРУБЫ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ КВАДРАТНОЙ ТРУБЫ
// ==========================================

const tubeSquareModule = {
    sortType: 'tube_square',

    showParameters: function() {
        console.log('🎯 [tube_square.js] showParameters вызван');

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

        console.log('📊 Материал для квадратной трубы:', materialKey, materialData);

        // Квадратная труба: массив объектов с side и wall
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры квадратной трубы для материала', materialKey, ':', sizes);

        // Создаем варианты размеров
        const sizeOptions = sizes.map(s => ({
            display: `${s.side}×${s.side}×${s.wall}`,
            value: JSON.stringify(s)
        }));

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер трубы (сторона×сторона×толщина стенки, мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizeOptions.map(opt => `<option value='${opt.value}'>${opt.display}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Информация о группе
        const groupInfo = document.createElement('div');
        groupInfo.className = 'param-group';
        groupInfo.innerHTML = `
            <label>Группа:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.group_index || 'В'}</strong>
                <br><small style="color: #666;">(с нормированием механических свойств)</small>
            </div>
        `;
        paramsContent.appendChild(groupInfo);

        // Информация о стандарте
        const standardInfo = document.createElement('div');
        standardInfo.className = 'param-group';
        standardInfo.innerHTML = `
            <label>Стандарт:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                ${window.currentSortData.standard || 'ГОСТ 8639-82'}
            </div>
        `;
        paramsContent.appendChild(standardInfo);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение квадратной трубы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры квадратной трубы отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [tube_square.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер квадратной трубы!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Парсим размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { side, wall } = sizeData;

            // Стандарт материала
            const materialStandard = window.currentSortData.material_standard ||
                                   window.getMaterialStandard(materialKey, this.sortType);

            const groupIndex = window.currentSortData.group_index || 'В';
            const standard = window.currentSortData.standard || 'ГОСТ 8639-82';

            // Формируем обозначение С ФЛАГОМ 'g' для всех вхождений!
            let numerator = window.currentSortData.designation_components?.numerator
                .replace(/{side}/g, side)  // g для всех вхождений
                .replace(/{wall}/g, wall)
                .replace(/{standard}/g, standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace(/{group_index}/g, groupIndex)
                .replace(/{material}/g, materialKey)
                .replace(/{material_standard}/g, materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации квадратной трубы:', {
                side, wall, materialKey, groupIndex, standard, materialStandard,
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
            console.error('❌ Ошибка генерации квадратной трубы:', error);
            alert('Ошибка при генерации обозначения квадратной трубы');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['tube_square'] = tubeSquareModule;