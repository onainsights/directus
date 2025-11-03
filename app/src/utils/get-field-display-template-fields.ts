import { useFieldsStore } from "@/stores/fields";
import { adjustFieldsForDisplays } from "./adjust-fields-for-displays";
import { getFieldsFromTemplate } from "@directus/utils";
import { getRelatedCollection } from "./get-related-collection";
import { getLocalTypeForField } from "./get-local-type";

export function getFieldDisplayTemplate(collection: string, field: string) {
    const fieldsStore = useFieldsStore();
    const fieldInfo = fieldsStore.getField(collection, field);
    if (!fieldInfo) return null;

    return fieldInfo?.meta?.options?.template ?? fieldInfo?.meta?.display_options?.template ?? null
}

export function getDisplayTemplateRelatedData(collection: string, field: string) {
    const localType = getLocalTypeForField(collection, field);
    if (localType !== 'm2o') return null;

    const template = getFieldDisplayTemplate(collection, field);
    if (!template) return null;

    const { relatedCollection } = getRelatedCollection(collection, field) || {};
    if (!relatedCollection) return null;

    const fieldsStore = useFieldsStore();
    const fields = adjustFieldsForDisplays(getFieldsFromTemplate(template), relatedCollection);
    const primaryKeyField = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection);
    let primaryKeyFieldValue = null;

    if (primaryKeyField) {
        primaryKeyFieldValue = primaryKeyField.field;

        if (!fields.includes(primaryKeyFieldValue)) {
            fields.push(primaryKeyFieldValue);
        }
    }

    return { fields, primaryKey: primaryKeyFieldValue, collection: relatedCollection };
}
