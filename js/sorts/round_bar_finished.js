// round_bar_finished.js - МОДУЛЬ ДЛЯ ПРУТКА КРУГЛОГО СО СПЕЦИАЛЬНОЙ ОТДЕЛКОЙ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ПРУТКА СО СПЕЦОТДЕЛКОЙ
// ==========================================

const roundBarFinishedModule = {
    sortType: 'round_bar_finished',

    showParameters: function() {
        console.log('🎯 [round_bar_finished.js] showParameters вызван');

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
        if (!materialData || !materialData.diameters) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по диаметрам для этого материала</div>';
            return;
        }

        // 4. Диаметр прутка
        const diameters = materialData.diameters;
        console.log('📏 Диаметры для материала', materialKey, ':', diameters);

        const diameterDiv = document.createElement('div');
        diameterDiv.className = 'param-group';
        diameterDiv.innerHTML = `
            <label>Диаметр прутка (мм):</label>
            <select class="diameter-select param-select">
                <option value="">-- Выбери диаметр --</option>
                ${diameters.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(diameterDiv);

        // 5. Группа качества поверхности (если есть выбор)
        const qualityClasses = materialData.quality_classes;
        if (qualityClasses && qualityClasses.length > 0) {
            const qualityDiv = document.createElement('div');
            qualityDiv.className = 'param-group';

            if (qualityClasses.length === 1) {
                // Только одно значение - показываем как информацию
                qualityDiv.innerHTML = `
                    <label>Группа качества поверхности:</label>
                    <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                        <strong>${qualityClasses[0]}</strong>
                        <br><small style="color: #666;">(определяется по материалу)</small>
                    </div>
                `;
            } else {
                // Несколько значений - выбор
                qualityDiv.innerHTML = `
                    <label>Группа качества поверхности:</label>
                    <select class="quality-select param-select">
                        <option value="">-- Выбери группу качества --</option>
                        ${qualityClasses.map(q => `<option value="${q}">${q}</option>`).join('')}
                    </select>
                `;
            }
            paramsContent.appendChild(qualityDiv);
        }

        // 6. Квалитет точности (если есть выбор)
        const accuracyClasses = materialData.accuracy_classes;
        if (accuracyClasses && accuracyClasses.length > 0) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'param-group';

            if (accuracyClasses.length === 1) {
                // Только одно значение - показываем как информацию
                accuracyDiv.innerHTML = `
                    <label>Квалитет точности:</label>
                    <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                        <strong>${accuracyClasses[0]}</strong>
                        <br><small style="color: #666;">(определяется по материалу)</small>
                    </div>
                `;
            } else {
                // Несколько значений - выбор
                accuracyDiv.innerHTML = `
                    <label>Квалитет точности:</label>
                    <select class="accuracy-select param-select">
                        <option value="">-- Выбери квалитет --</option>
                        ${accuracyClasses.map(a => `<option value="${a}">${a}</option>`).join('')}
                    </select>
                `;
            }
            paramsContent.appendChild(accuracyDiv);
        }

        // 7. Информация о стандарте
        const standardInfo = document.createElement('div');
        standardInfo.className = 'param-group';
        standardInfo.innerHTML = `
            <label>Стандарт на изделие:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${window.currentSortData.standard || 'ГОСТ 14955-77'}</strong>
                <br><small style="color: #666;">(Прутки круглые со специальной отделкой поверхности)</small>
            </div>
        `;
        paramsContent.appendChild(standardInfo);

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение прутка';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры прутка со спецотделкой отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [round_bar_finished.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const diameter = document.querySelector('.diameter-select')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем обязательные поля
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

        // 4. Формируем обозначение
        try {
            // Группа качества (выбор или первое значение)
            let qualityClass = '';
            const qualitySelect = document.querySelector('.quality-select');
            if (qualitySelect) {
                qualityClass = qualitySelect.value;
            } else if (materialData.quality_classes && materialData.quality_classes.length > 0) {
                qualityClass = materialData.quality_classes[0];
            }

            // Квалитет точности (выбор или первое значение)
            let accuracyClass = '';
            const accuracySelect = document.querySelector('.accuracy-select');
            if (accuracySelect) {
                accuracyClass = accuracySelect.value;
            } else if (materialData.accuracy_classes && materialData.accuracy_classes.length > 0) {
                accuracyClass = materialData.accuracy_classes[0];
            }

            // Проверяем что quality и accuracy выбраны (если есть выбор)
            if (qualitySelect && !qualityClass) {
                alert('❌ Выбери группу качества поверхности!');
                return;
            }
            if (accuracySelect && !accuracyClass) {
                alert('❌ Выбери квалитет точности!');
                return;
            }

            // 5. Формируем строку обозначения
            let fullDesignation = window.currentSortData.example_designation
                .replace(/{diameter}/g, diameter)
                .replace(/{quality}/g, qualityClass)
                .replace(/{accuracy}/g, accuracyClass)
                .replace(/{material}/g, materialKey)
                .replace(/{standard}/g, window.currentSortData.standard || '');

            // 6. Очистка и форматирование
            fullDesignation = fullDesignation
                .replace(/\s+/g, ' ') // убираем лишние пробелы
                .trim();

            // Убираем двойные дефисы
            fullDesignation = fullDesignation.replace(/-{2,}/g, '-');

            // Убираем дефис если qualityClass пустой
            if (!qualityClass && fullDesignation.includes('--')) {
                fullDesignation = fullDesignation.replace('--', '-');
            }

            console.log('📝 Результат генерации:', {
                materialKey,
                diameter,
                qualityClass,
                accuracyClass,
                fullDesignation
            });

            // 7. Показываем результат (недробный формат)
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Пруток',
                    fullDesignation.replace(window.currentSortData.product_name || '', '').trim(),
                    '', // пустой знаменатель для недробного формата
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
window.sortModules['round_bar_finished'] = roundBarFinishedModule;