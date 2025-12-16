// src/js/sorts/tape.js
const tapeModule = {
    sortType: 'tape',

    showParameters: function() {
        console.log('🎯 [tape.js] showParameters вызван');

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
        if (!materialData) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных для этого материала</div>';
            return;
        }

        // 1. Выбор толщины
        if (materialData.thicknesses_mm && materialData.thicknesses_mm.length > 0) {
            const thicknessDiv = document.createElement('div');
            thicknessDiv.className = 'param-group';
            thicknessDiv.innerHTML = `
                <label>Толщина (мм):</label>
                <select class="thickness-select param-select">
                    <option value="">-- Выбери толщину --</option>
                    ${materialData.thicknesses_mm.map(t =>
                        `<option value="${t}">${t}</option>`
                    ).join('')}
                </select>
            `;
            paramsContent.appendChild(thicknessDiv);
        }

        // 2. Класс точности (если есть выбор)
        if (materialData.accuracy_classes && materialData.accuracy_classes.length > 1) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'param-group';
            accuracyDiv.innerHTML = `
                <label>Класс точности:</label>
                <select class="accuracy-select param-select">
                    <option value="">-- Выбери класс точности --</option>
                    ${materialData.accuracy_classes.map(a =>
                        `<option value="${a}">${a} (${this.getAccuracyName(a)})</option>`
                    ).join('')}
                </select>
            `;
            paramsContent.appendChild(accuracyDiv);
        } else if (materialData.accuracy_classes && materialData.accuracy_classes.length === 1) {
            this.addInfoField('Класс точности:',
                `${materialData.accuracy_classes[0]} (${this.getAccuracyName(materialData.accuracy_classes[0])})`,
                paramsContent);
        }

        // 3. Вид поверхности (если есть выбор)
        if (materialData.surface_types && materialData.surface_types.length > 1) {
            const surfaceDiv = document.createElement('div');
            surfaceDiv.className = 'param-group';
            surfaceDiv.innerHTML = `
                <label>Вид поверхности:</label>
                <select class="surface-select param-select">
                    <option value="">-- Выбери вид поверхности --</option>
                    ${materialData.surface_types.map(s =>
                        `<option value="${s}">${s} (${this.getSurfaceName(s)})</option>`
                    ).join('')}
                </select>
            `;
            paramsContent.appendChild(surfaceDiv);
        } else if (materialData.surface_types && materialData.surface_types.length === 1) {
            this.addInfoField('Вид поверхности:',
                `${materialData.surface_types[0]} (${this.getSurfaceName(materialData.surface_types[0])})`,
                paramsContent);
        }

        // 4. Вид обработки (если есть выбор)
        if (materialData.processing_types && materialData.processing_types.length > 1) {
            const processingDiv = document.createElement('div');
            processingDiv.className = 'param-group';
            processingDiv.innerHTML = `
                <label>Вид обработки:</label>
                <select class="processing-select param-select">
                    <option value="">-- Выбери вид обработки --</option>
                    ${materialData.processing_types.map(p =>
                        `<option value="${p}">${p} (${this.getProcessingName(p)})</option>`
                    ).join('')}
                </select>
            `;
            paramsContent.appendChild(processingDiv);
        } else if (materialData.processing_types && materialData.processing_types.length === 1) {
            this.addInfoField('Вид обработки:',
                `${materialData.processing_types[0]} (${this.getProcessingName(materialData.processing_types[0])})`,
                paramsContent);
        }

        // Информация о стандарте
        this.addInfoField('Стандарт:', materialData.standard, paramsContent);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение ленты';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры ленты отображены');
    },

    getAccuracyName: function(code) {
        const names = {
            'НТ': 'нормальная точность',
            'Т': 'повышенная точность'
        };
        return names[code] || code;
    },

    getSurfaceName: function(code) {
        const names = {
            'С': 'светлая',
            '3': 'группа отделки 3'
        };
        return names[code] || code;
    },

    getProcessingName: function(code) {
        const names = {
            'Н': 'нагартованная',
            'М': 'мягкая'
        };
        return names[code] || code;
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
        console.log('🎯 [tape.js] generateDesignation вызван');

        // Получаем выбранные значения
        const materialKey = document.getElementById('materialSelect').value;
        const thickness = document.querySelector('.thickness-select')?.value;
        const materialData = window.currentSortData.materials?.[materialKey];

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        if (!thickness) {
            alert('❌ Выбери толщину!');
            return;
        }

        try {
            // Получаем значения (если нет выбора, берем единственное значение)
            const accuracy = materialData.accuracy_classes?.length === 1 ?
                materialData.accuracy_classes[0] :
                document.querySelector('.accuracy-select')?.value;

            const surface = materialData.surface_types?.length === 1 ?
                materialData.surface_types[0] :
                document.querySelector('.surface-select')?.value;

            const processing = materialData.processing_types?.length === 1 ?
                materialData.processing_types[0] :
                document.querySelector('.processing-select')?.value;

            // Проверяем обязательные поля
            if (!accuracy || !surface || !processing) {
                alert('❌ Заполни все параметры!');
                return;
            }

            // Формируем обозначение по шаблону из материала
            let designation = materialData.example_designation
                .replace(/{material}/g, materialKey)
                .replace(/{accuracy}/g, accuracy)
                .replace(/{surface}/g, surface)
                .replace(/{processing}/g, processing)
                .replace(/{thickness}/g, thickness)
                .replace(/{standard}/g, materialData.standard);

            // Убираем возможные двойные пробелы
            designation = designation.replace(/\s{2,}/g, ' ').trim();

            console.log('📝 Результат генерации:', {
                materialKey, thickness, accuracy, surface, processing,
                designation
            });

            // Показываем результат (лента использует example_designation, без дроби)
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    'Лента',  // product_name
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
window.sortModules['tape'] = tapeModule;