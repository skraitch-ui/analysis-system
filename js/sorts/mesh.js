// src/js/sorts/mesh.js
const meshModule = {
    sortType: 'mesh',

    showParameters: function() {
        console.log('🎯 [mesh.js] showParameters вызван');

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

        // 1. Выбор типа сетки
        const meshTypes = window.currentSortData.mesh_types;
        if (!meshTypes) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по типам сеток</div>';
            return;
        }

        const typeDiv = document.createElement('div');
        typeDiv.className = 'param-group';
        typeDiv.innerHTML = `
            <label>Тип сетки:</label>
            <select class="mesh-type-select param-select" onchange="window.sortModules.mesh.onMeshTypeChange()">
                <option value="">-- Выбери тип сетки --</option>
                <option value="wire_woven">${meshTypes.wire_woven.name}</option>
                <option value="steel_woven">${meshTypes.steel_woven.name}</option>
                <option value="steel_crimped">${meshTypes.steel_crimped.name}</option>
            </select>
        `;
        paramsContent.appendChild(typeDiv);

        // Контейнер для динамических параметров
        const dynamicParams = document.createElement('div');
        dynamicParams.id = 'meshDynamicParams';
        paramsContent.appendChild(dynamicParams);

        // Кнопка генерации (изначально скрыта)
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.id = 'meshGenerateBtn';
        button.style.display = 'none';
        button.innerHTML = '🎯 Сгенерировать обозначение сетки';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры сетки отображены');
    },

    onMeshTypeChange: function() {
        const typeSelect = document.querySelector('.mesh-type-select');
        const selectedType = typeSelect?.value;
        const dynamicParams = document.getElementById('meshDynamicParams');
        const generateBtn = document.getElementById('meshGenerateBtn');

        if (!selectedType || !dynamicParams) {
            return;
        }

        dynamicParams.innerHTML = '';
        generateBtn.style.display = 'none';

        const meshTypeData = window.currentSortData.mesh_types[selectedType];
        if (!meshTypeData || !meshTypeData.sizes) {
            return;
        }

        // Создаем выпадающий список размеров
        const sizes = Object.keys(meshTypeData.sizes);
        if (sizes.length > 0) {
            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'param-group';
            sizeDiv.innerHTML = `
                <label>Размер ячейки (мм):</label>
                <select class="mesh-size-select param-select">
                    <option value="">-- Выбери размер ячейки --</option>
                    ${sizes.map(sizeKey => {
                        const sizeData = meshTypeData.sizes[sizeKey];
                        let displayText = `${sizeData.cell_size} мм`;
                        if (sizeData.wire_diameter) {
                            displayText += `, проволока ${sizeData.wire_diameter} мм`;
                        }
                        // Сохраняем все данные в dataset
                        return `<option value="${sizeKey}"
                                data-cell-size="${sizeData.cell_size}"
                                data-cell-size-3digits="${sizeData.cell_size_3digits || ''}"
                                data-wire-diameter="${sizeData.wire_diameter || ''}"
                                data-wire-diameter-3digits="${sizeData.wire_diameter_3digits || ''}"
                                data-type="${sizeData.type || ''}">
                            ${displayText}
                        </option>`;
                    }).join('')}
                </select>
            `;
            dynamicParams.appendChild(sizeDiv);

            // Информация о стандарте
            this.addInfoField('Стандарт:', meshTypeData.standard, dynamicParams);

            generateBtn.style.display = 'block';
        }

        console.log(`✅ Показаны параметры для типа: ${selectedType}`);
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
        console.log('🎯 [mesh.js] generateDesignation вызван');

        const typeSelect = document.querySelector('.mesh-type-select');
        const sizeSelect = document.querySelector('.mesh-size-select');
        const selectedType = typeSelect?.value;
        const selectedOption = sizeSelect?.selectedOptions[0];

        if (!selectedType) {
            alert('❌ Выбери тип сетки!');
            return;
        }

        if (!selectedOption || !selectedOption.value) {
            alert('❌ Выбери размер ячейки!');
            return;
        }

        try {
            const meshTypeData = window.currentSortData.mesh_types[selectedType];

            // Получаем данные из выбранного option
            const cellSize = selectedOption.dataset.cellSize;
            const wireDiameter = selectedOption.dataset.wireDiameter;
            const cellSize3digits = selectedOption.dataset.cellSize3digits;
            const wireDiameter3digits = selectedOption.dataset.wireDiameter3digits;
            const typeCode = selectedOption.dataset.type;

            console.log('📊 Данные для генерации:', {
                cellSize, wireDiameter, cellSize3digits, wireDiameter3digits, typeCode
            });

            // Формируем обозначение по шаблону
            let designation = meshTypeData.example_designation;

            // Заменяем переменные с учетом их наличия
            if (designation.includes('{type}')) {
                designation = designation.replace(/{type}/g, typeCode || '');
            }

            if (designation.includes('{cell_size}')) {
                designation = designation.replace(/{cell_size}/g, cellSize);
            }

            if (designation.includes('{cell_size_3digits}')) {
                designation = designation.replace(/{cell_size_3digits}/g, cellSize3digits || cellSize);
            }

            if (designation.includes('{wire_diameter}')) {
                designation = designation.replace(/{wire_diameter}/g, wireDiameter || '');
            }

            if (designation.includes('{wire_diameter_3digits}')) {
                designation = designation.replace(/{wire_diameter_3digits}/g, wireDiameter3digits || wireDiameter || '');
            }

            if (designation.includes('{standard}')) {
                designation = designation.replace(/{standard}/g, meshTypeData.standard);
            }

            // Очистка: удаляем лишние пробелы, двойные дефисы, undefined
            designation = designation
                .replace(/undefined/g, '')  // удаляем undefined
                .replace(/\s{2,}/g, ' ')
                .replace(/-{2,}/g, '-')
                .replace(/\s-\s/g, ' ')  // удаляем дефис с пробелами вокруг
                .trim();

            // Убираем возможный лишний дефис в начале или конце
            if (designation.startsWith('-')) {
                designation = designation.substring(1).trim();
            }
            if (designation.endsWith('-')) {
                designation = designation.slice(0, -1).trim();
            }

            // Убираем возможный двойной пробел перед ГОСТ
            designation = designation.replace(/\sГОСТ/, ' ГОСТ');

            console.log('📝 Результат генерации:', {
                type: selectedType,
                cellSize, wireDiameter, typeCode,
                designation
            });

            // Показываем результат (сетка использует example_designation, без дроби)
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    'Сетка',  // product_name
                    '',       // numerator (пусто для недробного формата)
                    '',       // denominator (пусто для недробного формата)
                    designation
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
window.sortModules['mesh'] = meshModule;

// Экспортируем функцию для вызова из HTML
window.sortModules.mesh.onMeshTypeChange = meshModule.onMeshTypeChange.bind(meshModule);