// wire.js - МОДУЛЬ ДЛЯ ПРОВОЛОКИ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ПРОВОЛОКИ
// ==========================================

const wireModule = {
    sortType: 'wire',

    showParameters: function() {
        console.log('🎯 [wire.js] showParameters вызван');

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
        if (!materialData || !materialData.diameters_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по диаметрам для этого материала</div>';
            return;
        }

        // Проволока: диаметры
        const diameters = materialData.diameters_mm;
        console.log('📏 Диаметры проволоки для материала', materialKey, ':', diameters);

        // Выбор диаметра
        const diameterDiv = document.createElement('div');
        diameterDiv.className = 'param-group';
        diameterDiv.innerHTML = `
            <label>Диаметр проволоки (мм):</label>
            <select class="diameter-select param-select">
                <option value="">-- Выбери диаметр --</option>
                ${diameters.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(diameterDiv);

        // Выбор класса точности - ЕСЛИ БОЛЬШЕ ОДНОГО ВАРИАНТА
        if (materialData.accuracy_classes && materialData.accuracy_classes.length > 0) {
            // ЕСЛИ ТОЛЬКО ОДИН ВАРИАНТ - ПОКАЗЫВАЕМ ЕГО КАК ИНФОРМАЦИЮ
            if (materialData.accuracy_classes.length === 1) {
                const accuracyDiv = document.createElement('div');
                accuracyDiv.className = 'param-group';
                accuracyDiv.innerHTML = `
                    <label>Класс точности (информационно):</label>
                    <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                        <strong>${materialData.accuracy_classes[0]}</strong>
                        <br><small style="color: #666;">(класс точности не указывается в обозначении)</small>
                    </div>
                `;
                paramsContent.appendChild(accuracyDiv);
            } else {
                // ЕСЛИ НЕСКОЛЬКО ВАРИАНТОВ - ПОКАЗЫВАЕМ ВЫБОР
                const accuracyDiv = document.createElement('div');
                accuracyDiv.className = 'param-group';
                accuracyDiv.innerHTML = `
                    <label>Класс точности (информационно):</label>
                    <select class="accuracy-select param-select">
                        <option value="">-- Выбери класс точности --</option>
                        ${materialData.accuracy_classes.map(a => `<option value="${a}">${a}</option>`).join('')}
                    </select>
                    <small style="display: block; color: #666; margin-top: 5px;">(класс точности не указывается в обозначении)</small>
                `;
                paramsContent.appendChild(accuracyDiv);
            }
        }

        // Информация о группе отделки (суффикс)
        const groupSuffix = window.currentSortData.group_suffix_logic?.[materialKey];
        if (groupSuffix !== undefined) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'param-group';

            let displayText = '';
            if (groupSuffix === '') {
                displayText = 'без суффикса';
            } else if (groupSuffix === '-Б') {
                displayText = 'Б'; // Убираем дефис для отображения
            } else {
                displayText = groupSuffix;
            }

            groupDiv.innerHTML = `
                <label>Группа отделки поверхности:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${displayText}</strong>
                    <br><small style="color: #666;">(определяется по материалу)</small>
                </div>
            `;
            paramsContent.appendChild(groupDiv);
        }

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение проволоки';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры проволоки отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [wire.js] generateDesignation вызван');

        const diameter = document.querySelector('.diameter-select')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        if (!diameter) {
            alert('❌ Выбери диаметр проволоки!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        try {
            // Проволока имеет особый формат - без дроби!
            // example_designation: "Проволока {material}{group_suffix}-{diameter} {material_standard}"

            // ОСОБЕННОСТЬ ПРОВОЛОКИ: "Б класс прочности 1" → "Б-1"
            let wireMaterialCode = materialKey;

            // Преобразуем для проволоки
            if (materialKey === 'Б класс прочности 1') {
                wireMaterialCode = 'Б-1';
            } else if (materialKey === 'Б класс прочности 2А') {
                wireMaterialCode = 'Б-2А';
            }
            // Для 51ХФА оставляем как есть

            // Стандарт материала
            let materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // Суффикс группы (например, "-Б" для 51ХФА, пусто для других)
            const groupSuffix = window.currentSortData.group_suffix_logic?.[materialKey] || '';

            // Формируем обозначение без дроби
            let fullDesignation = window.currentSortData.example_designation
                .replace(/\{material\}/g, wireMaterialCode)
                .replace(/\{group_suffix\}/g, groupSuffix)
                .replace(/\{diameter\}/g, diameter)
                .replace(/\{material_standard\}/g, materialStandard);

            // Удаляем возможные лишние дефисы (вдруг получится "Б-1--0,4")
            fullDesignation = fullDesignation.replace(/--/g, '-');

            // Очистка от лишних пробелов
            const cleanDesignation = fullDesignation.replace(/\s+/g, ' ').trim();

            console.log('📝 Результат генерации проволоки:', {
                materialKey,
                wireMaterialCode,
                diameter,
                groupSuffix,
                materialStandard,
                cleanDesignation
            });

            // Для обозначений без дроби передаем пустой знаменатель
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name,
                    cleanDesignation,  // всё в числителе
                    '',               // пустой знаменатель
                    cleanDesignation
                );
            }

        } catch (error) {
            console.error('❌ Ошибка генерации проволоки:', error);
            alert('Ошибка при генерации обозначения проволоки');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['wire'] = wireModule;