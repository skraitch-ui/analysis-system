// square_bar.js - МОДУЛЬ ДЛЯ КВАДРАТА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ КВАДРАТНОГО ПРОКАТА
// ==========================================

const squareBarModule = {
    sortType: 'square_bar',

    showParameters: function() {
        console.log('🎯 [square_bar.js] showParameters вызван');

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
        if (!materialData || !materialData.sizes_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по размерам для этого материала</div>';
            return;
        }

        // Квадрат: простой массив размеров
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры квадрата для материала', materialKey, ':', sizes);

        // Выбор размера
        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер квадрата (мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // Выбор класса точности
        const accuracyDiv = document.createElement('div');
        accuracyDiv.className = 'param-group';

        // Берем классы точности из материала или из общих
        const accuracyClasses = materialData.accuracy_classes ||
                               window.currentSortData.accuracy_classes ||
                               [];

        if (accuracyClasses.length > 0) {
            accuracyDiv.innerHTML = `
                <label>Класс точности:</label>
                <select class="accuracy-select param-select">
                    <option value="">-- Выбери класс точности --</option>
                    ${accuracyClasses.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            `;
        } else {
            accuracyDiv.innerHTML = `
                <label>Класс точности:</label>
                <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
                    <strong>Не указан</strong>
                </div>
            `;
        }
        paramsContent.appendChild(accuracyDiv);

        // Информация о состоянии поставки
        if (materialData.delivery_condition) {
            const deliveryDiv = document.createElement('div');
            deliveryDiv.className = 'param-group';
            deliveryDiv.innerHTML = `
                <label>Состояние поставки:</label>
                <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                    ${materialData.delivery_condition}
                </div>
            `;
            paramsContent.appendChild(deliveryDiv);
        }

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение квадрата';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры квадрата отображены');
    },

    generateDesignation: function() {
        console.log('🎯 [square_bar.js] generateDesignation вызван');

        const size = document.querySelector('.size-select')?.value;
        const accuracy = document.querySelector('.accuracy-select')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        if (!size) {
            alert('❌ Выбери размер квадрата!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // Для квадрата accuracy может быть необязательным
        if (!accuracy && window.currentSortData.accuracy_classes?.length > 0) {
            alert('❌ Выбери класс точности!');
            return;
        }

        try {
            // Стандарт материала
            let materialStandard = window.getMaterialStandard(materialKey, this.sortType);

            // Формируем обозначение
            // numerator: "{accuracy}-{size} {standard}"
            // denominator: "{material} {material_standard}"

            let numerator = window.currentSortData.designation_components?.numerator
                .replace('{accuracy}', accuracy || '')
                .replace('{size}', size)
                .replace('{standard}', window.currentSortData.standard || 'ГОСТ 2591-2006');

            let denominator = window.currentSortData.designation_components?.denominator
                .replace('{material}', materialKey)
                .replace('{material_standard}', materialStandard);

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s+/g, ' ').trim();

            // Убираем "- " если accuracy пустой
            if (!accuracy) {
                numerator = numerator.replace(/^- /, '');
            }

            const fullDesignation = `${window.currentSortData.product_name} ${numerator}/${denominator}`;

            console.log('📝 Результат генерации квадрата:', {
                size, accuracy, materialKey, materialStandard,
                numerator, denominator, fullDesignation
            });

            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name,
                    numerator,
                    denominator,
                    fullDesignation
                );
            }

        } catch (error) {
            console.error('❌ Ошибка генерации квадрата:', error);
            alert('Ошибка при генерации обозначения квадрата');
        }
    }
};

// Регистрация
window.sortModules = window.sortModules || {};
window.sortModules['square_bar'] = squareBarModule;