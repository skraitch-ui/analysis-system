// channel.js - МОДУЛЬ ДЛЯ ШВЕЛЛЕРА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ШВЕЛЛЕРА
// ==========================================

const channelModule = {
    sortType: 'channel',

    showParameters: function() {
        console.log('🎯 [channel.js] showParameters вызван');

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

        console.log('📊 Материал для швеллера:', materialKey, materialData);

        // Швеллер: массив объектов с number, height, width, thickness, shelf_thickness
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры швеллера для материала', materialKey, ':', sizes);

        // Создаем варианты размеров
        const sizeOptions = sizes.map(s => ({
            display: `№${s.number} (${s.height}×${s.width}×${s.thickness})`,
            value: JSON.stringify(s)
        }));

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Номер швеллера:</label>
            <select class="size-select param-select">
                <option value="">-- Выбери номер --</option>
                ${sizeOptions.map(opt => `<option value='${opt.value}'>${opt.display}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

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

        // Информация о серии
        const seriesInfo = document.createElement('div');
        seriesInfo.className = 'param-group';
        seriesInfo.innerHTML = `
            <label>Серия:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${window.currentSortData.series || 'П'}</strong>
                <br><small style="color: #666;">(с параллельными гранями полок)</small>
            </div>
        `;
        paramsContent.appendChild(seriesInfo);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение швеллера';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры швеллера отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [channel.js] generateDesignation вызван');

        const sizeSelect = document.querySelector('.size-select');
        const materialKey = document.getElementById('materialSelect').value;

        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери номер швеллера!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Парсим размер
            const sizeData = JSON.parse(sizeSelect.value);
            const { number } = sizeData;

            // Стандарт материала
            const materialStandard = window.currentSortData.material_standard ||
                                   window.getMaterialStandard(materialKey, this.sortType);

            const qualityCategory = window.currentSortData.quality_category || '5';
            const standard = window.currentSortData.standard || 'ГОСТ 8240-97';

            // Формируем обозначение
            let numerator = window.currentSortData.designation_components?.numerator
                .replace('{number}', number)
                .replace('{standard}', standard);

            let denominator = window.currentSortData.designation_components?.denominator
                .replace('{quality_category}', qualityCategory)
                .replace('{material}', materialKey)
                .replace('{material_standard}', materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации швеллера:', {
                number, materialKey, qualityCategory, standard, materialStandard,
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
            console.error('❌ Ошибка генерации швеллера:', error);
            alert('Ошибка при генерации обозначения швеллера');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['channel'] = channelModule;