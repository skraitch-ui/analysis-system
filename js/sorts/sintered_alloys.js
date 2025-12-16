// sintered_alloys.js - МОДУЛЬ ДЛЯ ТВЁРДЫХ СПЕЧЁННЫХ СПЛАВОВ
// ==========================================
// 🎯 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ТВЁРДЫХ СПЕЧЁННЫХ СПЛАВОВ
// ==========================================

const sinteredAlloysModule = {
    sortType: 'sintered_alloys',

    showParameters: function() {
        console.log('🎯 [sintered_alloys.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        // Очищаем контейнер
        paramsContent.innerHTML = '';

        // 1. Проверяем что данные сортамента загружены
        if (!window.currentSortData || Object.keys(window.currentSortData).length === 0) {
            paramsContent.innerHTML = '<div class="error">⚠️ Данные не загружены</div>';
            return;
        }

        // 2. Получаем выбранный материал
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        // 3. Проверяем есть ли материал в alloy_groups
        const alloyData = this.findMaterialInAlloyGroups(materialKey);

        if (!alloyData) {
            paramsContent.innerHTML = '<div class="error">❌ Материал не найден в спечённых сплавах</div>';
            return;
        }

        // 4. Создаём интерфейс
        this.createInterface(paramsContent, materialKey, alloyData);
    },

    /**
     * ПОИСК МАТЕРИАЛА В ГРУППАХ СПЛАВОВ
     */
    findMaterialInAlloyGroups: function(materialKey) {
        if (!window.currentSortData.alloy_groups) return null;

        for (const [groupKey, groupData] of Object.entries(window.currentSortData.alloy_groups)) {
            if (groupData.grades && groupData.grades.includes(materialKey)) {
                return {
                    groupKey: groupKey,
                    groupName: groupData.name,
                    materialStandard: groupData.material_standard,
                    productStandard: groupData.product_standard,
                    exampleMaterial: groupData.example_material,
                    exampleProduct: groupData.example_product
                };
            }
        }
        return null;
    },

    /**
     * СОЗДАНИЕ ИНТЕРФЕЙСА
     */
    createInterface: function(container, materialKey, alloyData) {
        // Информация о материале
        const infoDiv = document.createElement('div');
        infoDiv.className = 'param-group';
        infoDiv.innerHTML = `
            <label>Информация:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>Группа сплавов:</strong> ${alloyData.groupName}<br>
                <strong>Материал:</strong> ${materialKey}<br>
                <strong>Стандарт материала:</strong> ${alloyData.materialStandard}
            </div>
        `;
        container.appendChild(infoDiv);

        // Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение';
        button.onclick = this.generateDesignation.bind(this);
        container.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
    },

    /**
     * ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЯ
     */
    generateDesignation: function() {
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        const alloyData = this.findMaterialInAlloyGroups(materialKey);

        if (!alloyData) {
            alert('❌ Ошибка данных материала');
            return;
        }

        try {
            // Формат: ВК8 ГОСТ 3882-74
            const fullDesignation = `${materialKey} ${alloyData.materialStandard}`;

            // Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    'Сплав',
                    '', // numerator
                    '', // denominator
                    fullDesignation
                );
            } else {
                alert('✅ Сгенерировано: ' + fullDesignation);
            }

        } catch (error) {
            console.error('❌ Ошибка генерации:', error);
            alert('Ошибка при генерации обозначения');
        }
    }
};

// ==========================================
// 📦 РЕГИСТРАЦИЯ МОДУЛЯ
// ==========================================

window.sortModules = window.sortModules || {};
window.sortModules['sintered_alloys'] = sinteredAlloysModule;