// plate.js - МОДУЛЬ ДЛЯ ТОЛСТОГО ЛИСТА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ТОЛСТОЛИСТОВОГО ПРОКАТА
// ==========================================

const plateModule = {
    sortType: 'plate',

    showParameters: function() {
        console.log('🎯 [plate.js] showParameters вызван');

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
        if (!materialData || !materialData.thicknesses_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по толщинам для этого материала</div>';
            return;
        }

        console.log('📦 Данные материала для plate:', materialData);

        // 4. Толщина листа
        const thicknesses = materialData.thicknesses_mm;
        console.log('📏 Толщины для материала', materialKey, ':', thicknesses);

        // Создаем select для толщины
        const thicknessDiv = document.createElement('div');
        thicknessDiv.className = 'param-group';
        thicknessDiv.innerHTML = `
            <label>Толщина листа (мм):</label>
            <select class="plate-thickness param-select">
                <option value="">-- Выбери толщину --</option>
                ${thicknesses.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(thicknessDiv);

        // 5. Информация о классе точности (обычно "Б" - обычная точность)
        const accuracyClass = window.currentSortData.accuracy_classes?.[0] || '';
        if (accuracyClass) {
            const accuracyInfo = document.createElement('div');
            accuracyInfo.className = 'param-group';
            accuracyInfo.innerHTML = `
                <label>Класс точности прокатки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${accuracyClass}</strong>
                    <br><small style="color: #666;">(определяется по сортаменту)</small>
                </div>
            `;
            paramsContent.appendChild(accuracyInfo);
        }

        // 6. Информация о состоянии поставки и термообработке
        const deliveryCondition = materialData.delivery_condition || '';
        if (deliveryCondition) {
            const deliveryInfo = document.createElement('div');
            deliveryInfo.className = 'param-group';

            let displayText = deliveryCondition;
            if (window.currentSortData.heat_treatment_logic?.[deliveryCondition]) {
                const suffix = window.currentSortData.heat_treatment_logic[deliveryCondition];
                if (suffix) {
                    displayText += ` (суффикс в обозначении: "${suffix}")`;
                }
            }

            deliveryInfo.innerHTML = `
                <label>Состояние поставки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${displayText}</strong>
                </div>
            `;
            paramsContent.appendChild(deliveryInfo);
        }

        // 7. Информация о стандарте материала
        const materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
        if (materialStandard) {
            const standardInfo = document.createElement('div');
            standardInfo.className = 'param-group';
            standardInfo.innerHTML = `
                <label>Стандарт на материал:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${materialStandard}</strong>
                </div>
            `;
            paramsContent.appendChild(standardInfo);
        }

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение толстого листа';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры толстого листа отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [plate.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const thickness = document.querySelector('.plate-thickness')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
        if (!thickness) {
            alert('❌ Выбери толщину листа!');
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

        // 4. Формируем компоненты обозначения
        try {
            // Класс точности (обычно "Б")
            const accuracyClass = window.currentSortData.accuracy_classes?.[0] || '';

            // Определяем стандарт материала
            let materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
            if (!materialStandard) {
                materialStandard = window.getMaterialStandard(materialKey, this.sortType);
            }

            // Состояние поставки и суффикс термообработки
            const deliveryCondition = materialData.delivery_condition || '';
            const heatSuffix = window.currentSortData.heat_treatment_logic?.[deliveryCondition] || '';

            // Product name
            const productName = window.currentSortData.product_name || 'Лист';

            // 5. Формируем обозначение по шаблону из JSON
            let numerator, denominator, fullDesignation;

            if (window.currentSortData.designation_components) {
                // Формируем числитель: "{accuracy}-{thickness} {standard}"
                numerator = window.currentSortData.designation_components.numerator
                    .replace('{accuracy}', accuracyClass)
                    .replace('{thickness}', thickness)
                    .replace('{standard}', window.currentSortData.standard || 'ГОСТ не указан');

                // Формируем знаменатель: "{material}{heat_treatment_suffix} {material_standard}"
                denominator = window.currentSortData.designation_components.denominator
                    .replace('{material}', materialKey)
                    .replace('{heat_treatment_suffix}', heatSuffix)
                    .replace('{material_standard}', materialStandard);

                fullDesignation = `${productName} ${numerator}/${denominator}`;
            } else {
                // Резервный вариант
                const sizePart = accuracyClass ? `${accuracyClass}-${thickness}` : thickness;
                numerator = `${sizePart} ${window.currentSortData.standard || 'ГОСТ не указан'}`;
                denominator = `${materialKey}${heatSuffix} ${materialStandard}`;
                fullDesignation = `${productName} ${numerator}/${denominator}`;
            }

            // 6. Очистка и форматирование
            // Убираем лишние пробелы и дефисы
            numerator = numerator.trim()
                .replace(/\s+/g, ' ')
                .replace(/^- /, '') // Убираем "- " если нет класса точности
                .replace(/-{2,}/g, '-')
                .replace(/\s-\s/g, ' ');

            denominator = denominator.trim()
                .replace(/\s+/g, ' ')
                .replace(/-{2,}/g, '-')
                .replace(/^\s*-\s*/, ''); // Убираем дефис в начале если есть

            // Убираем двойные пробелы
            numerator = numerator.replace(/\s{2,}/g, ' ');
            denominator = denominator.replace(/\s{2,}/g, ' ');

            // Убираем пустые классы точности
            if (!accuracyClass && numerator.startsWith('-')) {
                numerator = numerator.substring(1).trim();
            }

            console.log('📝 Результат генерации:', {
                materialKey,
                thickness,
                accuracyClass,
                deliveryCondition,
                heatSuffix,
                materialStandard,
                numerator,
                denominator,
                fullDesignation
            });

            // 7. Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    productName,
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

window.sortModules = window.sortModules || {};
window.sortModules['plate'] = plateModule;