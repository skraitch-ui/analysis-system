// sheet_ptk.js - МОДУЛЬ ДЛЯ ЛИСТА КРОВЕЛЬНОЙ СТАЛИ ПТК-1
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ЛИСТА ПТК-1
// ==========================================

const sheetPTKModule = {
    sortType: 'sheet_ptk',

    showParameters: function() {
        console.log('🎯 [sheet_ptk.js] showParameters вызван');

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

        // 2. Получаем выбранный материал (группа)
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        // 3. Проверяем что материал есть в данных сортамента
        const materialData = window.currentSortData.materials?.[materialKey];
        if (!materialData) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных для этого материала</div>';
            return;
        }

        // 4. Толщина листа
        const thicknesses = materialData.thicknesses_mm || [];
        if (thicknesses.length === 0) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по толщинам</div>';
            return;
        }

        const thicknessDiv = document.createElement('div');
        thicknessDiv.className = 'param-group';
        thicknessDiv.innerHTML = `
            <label>Толщина листа (мм):</label>
            <select class="thickness-select param-select">
                <option value="">-- Выбери толщину --</option>
                ${thicknesses.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(thicknessDiv);

        // 5. Ширина листа (фиксированная или выбор)
        const widths = materialData.widths_mm || [];
        if (widths.length === 1) {
            const widthInfo = document.createElement('div');
            widthInfo.className = 'param-group';
            widthInfo.innerHTML = `
                <label>Ширина листа (мм):</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${widths[0]}</strong>
                    <br><small style="color: #666;">(фиксированная ширина)</small>
                </div>
            `;
            paramsContent.appendChild(widthInfo);
        }

        // 6. Длина листа (фиксированная или выбор)
        const lengths = materialData.lengths_mm || [];
        if (lengths.length === 1) {
            const lengthInfo = document.createElement('div');
            lengthInfo.className = 'param-group';
            lengthInfo.innerHTML = `
                <label>Длина листа (мм):</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${lengths[0]}</strong>
                    <br><small style="color: #666;">(фиксированная длина)</small>
                </div>
            `;
            paramsContent.appendChild(lengthInfo);
        }

        // 7. Информация о классе точности
        const accuracyClass = materialData.accuracy_classes?.[0] || window.currentSortData.accuracy_classes?.[0];
        if (accuracyClass) {
            const accuracyInfo = document.createElement('div');
            accuracyInfo.className = 'param-group';
            accuracyInfo.innerHTML = `
                <label>Класс точности прокатки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${accuracyClass}</strong>
                    <br><small style="color: #666;">(повышенная точность по толщине)</small>
                </div>
            `;
            paramsContent.appendChild(accuracyInfo);
        }

        // 8. Информация о группе
        const group = materialData.group;
        if (group) {
            const groupInfo = document.createElement('div');
            groupInfo.className = 'param-group';
            groupInfo.innerHTML = `
                <label>Группа материала:</label>
                <div style="padding: 8px; background: #f0fff0; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                    <strong>${group}</strong>
                    <br><small style="color: #666;">(кровельная сталь)</small>
                </div>
            `;
            paramsContent.appendChild(groupInfo);
        }

        // 9. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение листа';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 10. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры листа ПТК-1 отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [sheet_ptk.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const thickness = document.querySelector('.thickness-select')?.value;
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

        // 4. Формируем обозначение
        try {
            // Фиксированные значения
            const width = materialData.widths_mm?.[0] || '';
            const length = materialData.lengths_mm?.[0] || '';
            const accuracyClass = materialData.accuracy_classes?.[0] || window.currentSortData.accuracy_classes?.[0] || '';
            const group = materialData.group || '';

            // 5. Формируем числитель и знаменатель
            let numerator = window.currentSortData.designation_components.numerator
                .replace(/{accuracy}/g, accuracyClass)
                .replace(/{thickness}/g, thickness)
                .replace(/{width}/g, width)
                .replace(/{length}/g, length)
                .replace(/{standard}/g, window.currentSortData.standard || '');

            let denominator = window.currentSortData.designation_components.denominator
                .replace(/{group}/g, group)
                .replace(/{material_standard}/g, window.currentSortData.material_standard || '');

            // 6. Очистка и форматирование
            numerator = numerator
                .replace(/\s+/g, ' ')
                .trim();

            denominator = denominator
                .replace(/\s+/g, ' ')
                .trim();

            // Убираем "- " если accuracyClass пустой
            if (!accuracyClass && numerator.startsWith('- ')) {
                numerator = numerator.substring(2);
            }

            // 7. Полное обозначение
            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации:', {
                materialKey,
                thickness,
                width,
                length,
                accuracyClass,
                group,
                numerator,
                denominator,
                fullDesignation
            });

            // 8. Показываем результат (дробный формат)
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Лист',
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

if (!window.sortModules) window.sortModules = {};
window.sortModules['sheet_ptk'] = sheetPTKModule;