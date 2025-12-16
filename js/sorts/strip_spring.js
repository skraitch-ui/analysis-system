// strip_spring.js - МОДУЛЬ ДЛЯ РЕССОРНОЙ ПОЛОСЫ
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ПОЛОСЫ РЕССОРНОЙ ГОРЯЧЕКАТАНОЙ
// ==========================================

const stripSpringModule = {
    sortType: 'strip_spring',

    showParameters: function() {
        console.log('🎯 [strip_spring.js] showParameters вызван');

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
        if (!materialData || !materialData.sizes_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по размерам для этого материала</div>';
            return;
        }

        // 4. Размеры полосы (толщина x ширина)
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры для материала', materialKey, ':', sizes);

        // Создаем select для размера
        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер полосы (толщина × ширина, мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizes.map(size =>
                    `<option value="${size.thickness}x${size.width}" data-thickness="${size.thickness}" data-width="${size.width}">
                        ${size.thickness} × ${size.width}
                    </option>`
                ).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

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

        // 6. Информация о способе изготовления
        const deliveryMethod = window.currentSortData.delivery_method || 'горячекатаный';
        const deliveryInfo = document.createElement('div');
        deliveryInfo.className = 'param-group';
        deliveryInfo.innerHTML = `
            <label>Способ изготовления:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${deliveryMethod}</strong>
                <br><small style="color: #666;">(рессорные полосы изготавливаются горячей прокаткой)</small>
            </div>
        `;
        paramsContent.appendChild(deliveryInfo);

        // 7. Информация о стандарте материала (если есть специальный)
        const materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
        if (materialStandard) {
            const standardInfo = document.createElement('div');
            standardInfo.className = 'param-group';
            standardInfo.innerHTML = `
                <label>Стандарт материала:</label>
                <div style="padding: 8px; background: #f0fff0; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                    <strong>${materialStandard}</strong>
                    <br><small style="color: #666;">(специальный стандарт для рессорной стали)</small>
                </div>
            `;
            paramsContent.appendChild(standardInfo);
        }

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение полосы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры рессорной полосы отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [strip_spring.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const sizeSelect = document.querySelector('.size-select');
        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер полосы!');
            return;
        }

        const thickness = sizeSelect.options[sizeSelect.selectedIndex].dataset.thickness;
        const width = sizeSelect.options[sizeSelect.selectedIndex].dataset.width;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
        if (!thickness || !width) {
            alert('❌ Ошибка: не удалось получить размеры!');
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

            // Стандарт материала (специальный или общий)
            let materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
            if (!materialStandard) {
                materialStandard = window.getMaterialStandard(materialKey, this.sortType);
            }

            // 5. Формируем числитель и знаменатель
            let numerator = window.currentSortData.designation_components.numerator
                .replace(/{accuracy}/g, accuracyClass)
                .replace(/{thickness}/g, thickness)
                .replace(/{width}/g, width)
                .replace(/{standard}/g, window.currentSortData.standard || '');

            let denominator = window.currentSortData.designation_components.denominator
                .replace(/{material}/g, materialKey)
                .replace(/{material_standard}/g, materialStandard);

            // 6. Очистка и форматирование
            numerator = numerator
                .replace(/\s+/g, ' ') // убираем лишние пробелы
                .trim();

            denominator = denominator
                .replace(/\s+/g, ' ')
                .trim();

            // Убираем "- " если accuracyClass пустой
            if (!accuracyClass && numerator.startsWith('- ')) {
                numerator = numerator.substring(2);
            }

            // Убираем двойные дефисы
            numerator = numerator.replace(/-{2,}/g, '-');

            // 7. Полное обозначение
            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации:', {
                materialKey,
                accuracyClass,
                thickness,
                width,
                numerator,
                denominator,
                fullDesignation
            });

            // 8. Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Полоса',
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
window.sortModules['strip_spring'] = stripSpringModule;