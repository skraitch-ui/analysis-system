// src/js/sorts/beam.js
const beamModule = {
    sortType: 'beam',

    showParameters: function() {
        console.log('🎯 [beam.js] showParameters вызван');

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

        // Создаем выпадающий список номеров профилей
        const sizeSelect = document.createElement('select');
        sizeSelect.className = 'number-select param-select';
        sizeSelect.innerHTML = `
            <option value="">-- Выбери номер профиля --</option>
            ${materialData.sizes_mm.map(size =>
                `<option value="${size.number}"
                        data-number="${size.number}"
                        data-height="${size.height}"
                        data-width="${size.width}"
                        data-thickness="${size.thickness}"
                        data-shelf-thickness="${size.shelf_thickness}">
                    №${size.number} (${size.height}×${size.width}×${size.thickness}×${size.shelf_thickness})
                </option>`
            ).join('')}
        `;

        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = '<label>Номер профиля (размеры в мм):</label>';
        sizeDiv.appendChild(sizeSelect);
        paramsContent.appendChild(sizeDiv);

        // Информационные поля (только для чтения)
        this.addInfoField('Точность прокатки:', window.currentSortData.accuracy, paramsContent);
        this.addInfoField('Категория качества:', window.currentSortData.quality_category, paramsContent);
        this.addInfoField('Стандарт:', window.currentSortData.standard, paramsContent);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение балки';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры балки отображены');
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
        console.log('🎯 [beam.js] generateDesignation вызван');

        // Получаем выбранные значения
        const materialKey = document.getElementById('materialSelect').value;
        const sizeSelect = document.querySelector('.number-select');
        const selectedOption = sizeSelect?.selectedOptions[0];

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        if (!selectedOption || !selectedOption.value) {
            alert('❌ Выбери номер профиля!');
            return;
        }

        try {
            const number = selectedOption.dataset.number;

            // Получаем стандарт материала
            const materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // Формируем числитель по шаблону
            let numerator = window.currentSortData.designation_components.numerator
                .replace(/{accuracy}/g, window.currentSortData.accuracy)
                .replace(/{number}/g, number)
                .replace(/{standard}/g, window.currentSortData.standard);

            // Формируем знаменатель по шаблону
            let denominator = window.currentSortData.designation_components.denominator
                .replace(/{material}/g, materialKey)
                .replace(/{quality_category}/g, window.currentSortData.quality_category)
                .replace(/{material_standard}/g, materialStandard);

            // Убираем возможные двойные пробелы
            numerator = numerator.replace(/\s{2,}/g, ' ').trim();
            denominator = denominator.replace(/\s{2,}/g, ' ').trim();

            // Полное обозначение
            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации:', {
                materialKey, number,
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
window.sortModules['beam'] = beamModule;