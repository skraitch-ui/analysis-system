// src/js/sorts/channel_bent.js
const channelBentModule = {
    sortType: 'channel_bent',

    showParameters: function() {
        console.log('🎯 [channel_bent.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        // Очищаем контейнер
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

        // Создаем выпадающий список типоразмеров
        const sizeSelect = document.createElement('select');
        sizeSelect.className = 'size-select param-select';
        sizeSelect.innerHTML = `
            <option value="">-- Выбери типоразмер (В×Ш×Т, мм) --</option>
            ${materialData.sizes_mm.map(size =>
                `<option value="${size.height}x${size.width}x${size.thickness}"
                        data-height="${size.height}"
                        data-width="${size.width}"
                        data-thickness="${size.thickness}">
                    ${size.height}×${size.width}×${size.thickness}
                </option>`
            ).join('')}
        `;

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = '<label>Типоразмер (В×Ш×Т, мм):</label>';
        sizeDiv.appendChild(sizeSelect);
        paramsContent.appendChild(sizeDiv);

        // Информационные поля (только для чтения)
        this.addInfoField('Точность профилирования:', window.currentSortData.accuracy_profile, paramsContent);
        this.addInfoField('Точность прокатки:', window.currentSortData.accuracy_rolling, paramsContent);
        this.addInfoField('Категория качества:', window.currentSortData.quality_category, paramsContent);
        this.addInfoField('Стандарт:', window.currentSortData.standard, paramsContent);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение швеллера';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры швеллера гнутого отображены');
    },

    addInfoField: function(label, value, container) {
        const div = document.createElement('div');
        div.className = 'param-group';
        div.innerHTML = `
            <label>${label}</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                <strong>${value}</strong>
            </div>
        `;
        container.appendChild(div);
    },

    generateDesignation: function() {
        console.log('🎯 [channel_bent.js] generateDesignation вызван');

        // Получаем выбранные значения
        const materialKey = document.getElementById('materialSelect').value;
        const sizeSelect = document.querySelector('.size-select');
        const selectedOption = sizeSelect?.selectedOptions[0];

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        if (!selectedOption || !selectedOption.value) {
            alert('❌ Выбери типоразмер!');
            return;
        }

        try {
            const height = selectedOption.dataset.height;
            const width = selectedOption.dataset.width;
            const thickness = selectedOption.dataset.thickness;

            // Получаем стандарт материала
            const materialStandard = window.getMaterialStandard(materialKey, this.sortType) ||
                                   window.currentSortData.material_standard;

            // Формируем числитель по шаблону
            let numerator = window.currentSortData.designation_components.numerator
                .replace('{accuracy_profile}', window.currentSortData.accuracy_profile)
                .replace('{height}', height)
                .replace('{width}', width)
                .replace('{thickness}', thickness)
                .replace('{accuracy_rolling}', window.currentSortData.accuracy_rolling)
                .replace('{standard}', window.currentSortData.standard);

            // Формируем знаменатель по шаблону
            let denominator = window.currentSortData.designation_components.denominator
                .replace('{quality_category}', window.currentSortData.quality_category)
                .replace('{material}', materialKey)
                .replace('{material_standard}', materialStandard);

            // Убираем возможные двойные пробелы
            numerator = numerator.replace(/\s{2,}/g, ' ').trim();
            denominator = denominator.replace(/\s{2,}/g, ' ').trim();

            // Полное обозначение
            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации:', {
                materialKey, height, width, thickness,
                numerator, denominator, fullDesignation
            });

            // Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name,
                    numerator,
                    denominator,
                    fullDesignation
                );
            } else {
                alert('Ошибка: функция отображения результата не найдена');
            }

        } catch (error) {
            console.error('❌ Ошибка генерации:', error);
            alert('Ошибка при генерации обозначения. Проверьте данные.');
        }
    }
};

// Регистрация модуля
window.sortModules = window.sortModules || {};
window.sortModules['channel_bent'] = channelBentModule;