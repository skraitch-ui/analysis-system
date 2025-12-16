// ribbed_sheet.js - МОДУЛЬ ДЛЯ РИФЛЁНОГО ЛИСТА (ЛИСТ-РОМБ) - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ЛИСТА РИФЛЁНОГО РОМБИЧЕСКОГО
// ==========================================

const ribbedSheetModule = {
    sortType: 'ribbed_sheet',

    showParameters: function() {
        console.log('🎯 [ribbed_sheet.js] showParameters вызван');

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

        // 4. Толщина листа
        const thicknesses = materialData.thicknesses_mm;
        console.log('📏 Толщины для материала', materialKey, ':', thicknesses);

        // Создаем select для толщины
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

        // 5. Информация о классе точности (НЕ ВЫБОР, А ОТОБРАЖЕНИЕ)
        const accuracyClass = materialData.accuracy_classes?.[0] || window.currentSortData.accuracy_classes?.[0];
        if (accuracyClass) {
            const accuracyInfo = document.createElement('div');
            accuracyInfo.className = 'param-group';
            accuracyInfo.innerHTML = `
                <label>Класс точности прокатки:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${accuracyClass}</strong>
                    <br><small style="color: #666;">(определяется стандартом)</small>
                </div>
            `;
            paramsContent.appendChild(accuracyInfo);
        }

        // 6. Информация о типе рифления
        const pattern = window.currentSortData.pattern;
        const patternCode = window.currentSortData.pattern_code;
        if (pattern && patternCode) {
            const patternInfo = document.createElement('div');
            patternInfo.className = 'param-group';
            patternInfo.innerHTML = `
                <label>Тип рифления:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>${pattern} (${patternCode})</strong>
                    <br><small style="color: #666;">(рифический лист по ГОСТ 8568-77)</small>
                </div>
            `;
            paramsContent.appendChild(patternInfo);
        }

        // 7. Способ изготовления (информация)
        const deliveryMethod = window.currentSortData.delivery_method || 'горячекатаный';
        const deliveryInfo = document.createElement('div');
        deliveryInfo.className = 'param-group';
        deliveryInfo.innerHTML = `
            <label>Способ изготовления:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${deliveryMethod}</strong>
                <br><small style="color: #666;">(все рифлёные листы изготавливаются горячей прокаткой)</small>
            </div>
        `;
        paramsContent.appendChild(deliveryInfo);

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение листа';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры рифлёного листа отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [ribbed_sheet.js] generateDesignation вызван');

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
            // Класс точности
            const accuracyClass = materialData.accuracy_classes?.[0] || window.currentSortData.accuracy_classes?.[0] || '';

            // Тип рифления (код)
            const patternCode = window.currentSortData.pattern_code || '';

            // 5. Формируем строку обозначения по example_designation
            // Формат: "Лист ромб {accuracy}-{pattern_code}-{thickness} {material} {standard}"
            let fullDesignation = window.currentSortData.example_designation
                .replace(/{accuracy}/g, accuracyClass)
                .replace(/{pattern_code}/g, patternCode)
                .replace(/{thickness}/g, thickness)
                .replace(/{material}/g, materialKey)
                .replace(/{standard}/g, window.currentSortData.standard || '');

            // 6. Очистка и форматирование
            fullDesignation = fullDesignation
                .replace(/\s+/g, ' ') // убираем лишние пробелы
                .trim();

            // Убираем "- " если accuracyClass пустой
            if (!accuracyClass && fullDesignation.includes('--')) {
                fullDesignation = fullDesignation.replace('--', '-');
            }

            // Убираем двойные дефисы
            fullDesignation = fullDesignation.replace(/-{2,}/g, '-');

            console.log('📝 Результат генерации:', {
                materialKey,
                accuracyClass,
                patternCode,
                thickness,
                fullDesignation
            });

            // 7. Проверяем какой формат example_designation (старый с "/" или новый без)
            const hasSlash = window.currentSortData.example_designation.includes('/');

            if (typeof window.showDesignationResult === 'function') {
                if (hasSlash) {
                    // СТАРЫЙ ФОРМАТ с "/" - разделяем
                    const parts = fullDesignation.split('/');
                    if (parts.length === 2) {
                        const productAndNumerator = parts[0];
                        const denominator = parts[1];
                        const productName = window.currentSortData.product_name || 'Лист ромб';
                        const numerator = productAndNumerator.replace(productName, '').trim();

                        window.showDesignationResult(
                            productName,
                            numerator,
                            denominator,
                            fullDesignation
                        );
                    } else {
                        // Если не нашли "/", показываем как единое обозначение
                        window.showDesignationResult(
                            window.currentSortData.product_name || 'Лист ромб',
                            fullDesignation.replace(window.currentSortData.product_name || '', '').trim(),
                            '',
                            fullDesignation
                        );
                    }
                } else {
                    // НОВЫЙ ФОРМАТ без "/" - показываем как единое обозначение
                    window.showDesignationResult(
                        window.currentSortData.product_name || 'Лист ромб',
                        fullDesignation.replace(window.currentSortData.product_name || '', '').trim(),
                        '', // пустой знаменатель
                        fullDesignation
                    );
                }
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
window.sortModules['ribbed_sheet'] = ribbedSheetModule;