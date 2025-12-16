// tube_rectangular.js - МОДУЛЬ ДЛЯ ПРЯМОУГОЛЬНОЙ ТРУБЫ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ПРЯМОУГОЛЬНОЙ ТРУБЫ
// ==========================================

const tubeRectangularModule = {
    sortType: 'tube_rectangular',

    showParameters: function() {
        console.log('🎯 [tube_rectangular.js] showParameters вызван');

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

        console.log('📊 Материал для прямоугольной трубы:', materialKey, materialData);

        // Прямоугольная труба: массив объектов с height, width и wall
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры прямоугольной трубы для материала', materialKey, ':', sizes);

        // Создаем варианты размеров
        const sizeOptions = sizes.map(s => ({
            display: `${s.height}×${s.width}×${s.wall}`,
            value: JSON.stringify(s)
        }));

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер трубы (высота×ширина×толщина стенки, мм):</label>
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
                ${window.currentSortData.standard || 'ГОСТ 8645-82'}
            </div>
        `;
        paramsContent.appendChild(standardInfo);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение прямоугольной трубы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры прямоугольной трубы отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [tube_rectangular.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер прямоугольной трубы!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Парсим размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { height, width, wall } = sizeData;

            // Стандарт материала
            const materialStandard = window.currentSortData.material_standard ||
                                   window.getMaterialStandard(materialKey, this.sortType);

            const groupIndex = window.currentSortData.group_index || 'В';
            const standard = window.currentSortData.standard || 'ГОСТ 8645-82';

            // Формируем обозначение
            let numerator = window.currentSortData.designation_components?.numerator
                .replace('{height}', height)
                .replace('{width}', width)
                .replace('{wall}', wall)
                .replace('{standard}', standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace('{group_index}', groupIndex)
                .replace('{material}', materialKey)
                .replace('{material_standard}', materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации прямоугольной трубы:', {
                height, width, wall, materialKey, groupIndex, standard, materialStandard,
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
            console.error('❌ Ошибка генерации прямоугольной трубы:', error);
            alert('Ошибка при генерации обозначения прямоугольной трубы');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['tube_rectangular'] = tubeRectangularModule;