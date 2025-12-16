// round-bar.js - МОДУЛЬ ДЛЯ КРУГЛОГО ПРУТКА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ КРУГЛОГО ПРОКАТА
// ==========================================

const roundBarModule = {
    sortType: 'round_bar',

    showParameters: function() {
        console.log('🎯 [round-bar.js] showParameters вызван');

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

        console.log('📦 Данные материала для round_bar:', materialData);

        // 4. Класс точности (из общего списка сортамента)
        const accuracyClasses = window.currentSortData.accuracy_classes || [];
        let accuracySelect = null;

        if (accuracyClasses.length > 0) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'param-group';
            accuracyDiv.innerHTML = `
                <label>Класс точности прокатки:</label>
                <select class="roundbar-accuracy param-select">
                    <option value="">-- Выбери класс точности --</option>
                    ${accuracyClasses.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            `;
            paramsContent.appendChild(accuracyDiv);
            accuracySelect = paramsContent.querySelector('.roundbar-accuracy');
        }

        // 5. Диаметр
        const diameters = materialData.diameters_mm;
        console.log('📏 Диаметры для материала', materialKey, ':', diameters);

        const diameterDiv = document.createElement('div');
        diameterDiv.className = 'param-group';
        diameterDiv.innerHTML = `
            <label>Диаметр (мм):</label>
            <select class="roundbar-diameter param-select">
                <option value="">-- Выбери диаметр --</option>
                ${diameters.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(diameterDiv);

        // 6. Информация о состоянии поставки (из данных материала)
        const deliveryCondition = materialData.delivery_condition;
        if (deliveryCondition) {
            const deliveryInfo = document.createElement('div');
            deliveryInfo.className = 'param-group';

            // Форматируем текст для отображения
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

        // 7. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение круглого прутка';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 8. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры круглого прутка отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [round-bar.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const diameter = document.querySelector('.roundbar-diameter')?.value;
        const accuracyClass = document.querySelector('.roundbar-accuracy')?.value || '';
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
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

        // 4. Формируем компоненты обозначения
        try {
            // Определяем стандарт материала
            const materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // Состояние поставки и суффикс термообработки
            const deliveryCondition = materialData.delivery_condition || '';
            const heatSuffix = window.currentSortData.heat_treatment_logic?.[deliveryCondition] || '';

            // Product name
            const productName = window.currentSortData.product_name || 'Круг';

            // 5. Формируем обозначение по шаблону из JSON
            let numerator, denominator, fullDesignation;

            if (window.currentSortData.designation_components) {
                // Формируем числитель: "{accuracy}-{diameter} {standard}"
                numerator = window.currentSortData.designation_components.numerator
                    .replace('{accuracy}', accuracyClass)
                    .replace('{diameter}', diameter)
                    .replace('{standard}', window.currentSortData.standard || 'ГОСТ не указан');

                // Формируем знаменатель: "{material}{heat_treatment_suffix} {material_standard}"
                denominator = window.currentSortData.designation_components.denominator
                    .replace('{material}', materialKey)
                    .replace('{heat_treatment_suffix}', heatSuffix)
                    .replace('{material_standard}', materialStandard);

                fullDesignation = `${productName} ${numerator}/${denominator}`;
            } else {
                // Резервный вариант если нет компонентов
                const sizePart = accuracyClass ? `${accuracyClass}-${diameter}` : diameter;
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

            // Убираем двойные пробелы после форматирования
            numerator = numerator.replace(/\s{2,}/g, ' ');
            denominator = denominator.replace(/\s{2,}/g, ' ');

            // 7. Убираем пустые классы точности
            if (!accuracyClass && numerator.startsWith('-')) {
                numerator = numerator.substring(1).trim();
            }

            console.log('📝 Результат генерации:', {
                materialKey,
                diameter,
                accuracyClass,
                deliveryCondition,
                heatSuffix,
                materialStandard,
                numerator,
                denominator,
                fullDesignation
            });

            // 8. Показываем результат
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
window.sortModules['round_bar'] = roundBarModule;