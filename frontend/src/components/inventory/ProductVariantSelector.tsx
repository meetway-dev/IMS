'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Package, Tag, Hash, DollarSign, Box } from 'lucide-react';

export interface VariantAttribute {
  id: string;
  name: string;
  values: Array<{ id: string; value: string; code: string }>;
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  price: number;
  barcode?: string;
  image?: string;
}

interface ProductVariantSelectorProps {
  attributes: VariantAttribute[];
  variants: ProductVariant[];
  onVariantSelect: (variantId: string) => void;
  selectedVariant?: string;
  showStock?: boolean;
  showPrice?: boolean;
  compact?: boolean;
}

export function ProductVariantSelector({
  attributes,
  variants,
  onVariantSelect,
  selectedVariant,
  showStock = true,
  showPrice = true,
  compact = false,
}: ProductVariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>(variants);

  // Find selected variant
  const selectedVariantData = variants.find(v => v.id === selectedVariant);

  // Reset selections when variants change
  useEffect(() => {
    setAvailableVariants(variants);
  }, [variants]);

  const handleAttributeSelect = (attributeId: string, valueId: string) => {
    const newSelection = { ...selectedAttributes, [attributeId]: valueId };
    setSelectedAttributes(newSelection);

    // Find matching variant
    const matchingVariant = variants.find(variant =>
      Object.entries(newSelection).every(([attrId, valId]) =>
        variant.attributes[attrId] === valId
      )
    );

    if (matchingVariant) {
      onVariantSelect(matchingVariant.id);
    } else {
      onVariantSelect('');
    }
  };

  const getAvailableValues = (attributeId: string) => {
    const otherSelections = { ...selectedAttributes };
    delete otherSelections[attributeId];

    const attribute = attributes.find(attr => attr.id === attributeId);
    if (!attribute) return [];

    return attribute.values.filter(value =>
      variants.some(variant =>
        variant.attributes[attributeId] === value.id &&
        Object.entries(otherSelections).every(([attrId, valId]) =>
          variant.attributes[attrId] === valId
        )
      )
    );
  };

  const clearSelections = () => {
    setSelectedAttributes({});
    onVariantSelect('');
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'destructive' };
    if (quantity <= 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {/* Selected variant display */}
      {selectedVariantData && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Selected Variant</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">SKU</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedVariantData.sku}
                    </code>
                  </div>
                  {showPrice && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">Price</span>
                      </div>
                      <div className="text-lg font-semibold">
                        ${selectedVariantData.price.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {showStock && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Box className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">Stock</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {selectedVariantData.stock}
                        </span>
                        <Badge variant={getStockStatus(selectedVariantData.stock).color as any}>
                          {getStockStatus(selectedVariantData.stock).label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelections}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attribute selectors */}
      <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
        {attributes.map((attribute) => {
          const availableValues = getAvailableValues(attribute.id);
          const isDisabled = availableValues.length === 0 && Object.keys(selectedAttributes).length > 0;

          return (
            <div key={attribute.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={attribute.id} className="font-medium">
                  {attribute.name}
                </Label>
                {isDisabled && (
                  <span className="text-xs text-muted-foreground">
                    No variants with current selection
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const isAvailable = availableValues.some(v => v.id === value.id);
                  const isSelected = selectedAttributes[attribute.id] === value.id;
                  const isSelectable = isAvailable || Object.keys(selectedAttributes).length === 0;

                  return (
                    <Button
                      key={value.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        'transition-all',
                        !isSelectable && 'opacity-50 cursor-not-allowed',
                        isSelected && 'border-primary bg-primary text-primary-foreground'
                      )}
                      onClick={() => isSelectable && handleAttributeSelect(attribute.id, value.id)}
                      disabled={!isSelectable}
                    >
                      {value.value}
                      {value.code && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {value.code}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Variants grid */}
      {!compact && variants.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">All Variants</h4>
              <span className="text-sm text-muted-foreground">
                {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {variants.map((variant) => {
                const isSelected = variant.id === selectedVariant;
                const stockStatus = getStockStatus(variant.stock);

                return (
                  <Card
                    key={variant.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary/50',
                      isSelected && 'border-primary bg-primary/5'
                    )}
                    onClick={() => onVariantSelect(variant.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {variant.sku}
                              </code>
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {Object.entries(variant.attributes).map(([attrId, valId]) => {
                                const attribute = attributes.find(a => a.id === attrId);
                                const value = attribute?.values.find(v => v.id === valId);
                                return attribute && value ? (
                                  <div key={attrId} className="flex items-center gap-1">
                                    <span className="font-medium">{attribute.name}:</span>
                                    <span>{value.value}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-semibold">${variant.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Box className="h-3 w-3" />
                              <span className={cn(
                                'font-semibold',
                                variant.stock === 0 && 'text-destructive',
                                variant.stock <= 10 && variant.stock > 0 && 'text-warning'
                              )}>
                                {variant.stock} units
                              </span>
                            </div>
                          </div>
                          <Badge variant={stockStatus.color as any}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}