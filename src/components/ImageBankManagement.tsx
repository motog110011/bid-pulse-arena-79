import { useState, useEffect } from 'react'
import { useProductImages, useProductImageMappings, type ProductImage, type ProductImageMapping } from '@/hooks/useProductImages'
import { useAutoMappingRules } from '@/hooks/useAutoMappingRules'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, Image, Plus, Edit2, Trash2, Eye, EyeOff, X, Sparkles } from 'lucide-react'

interface NewImageForm {
  files: File[]
  label: string
  category: string
  brand: string
  product_type: string
  tags: string
}

interface NewMappingForm {
  image_id: string
  category: string
  brand: string
  product_type: string
  contains_keywords: string
  priority: number
}

const CATEGORIES = [
  'Electrónicos',
  'Navajas', 
  'Vinos y Licores',
  'Cosméticos',
  'Joyería'
]

export function ImageBankManagement() {
  const { toast } = useToast()
  const { data: images, refetch: refetchImages } = useProductImages()
  const { data: mappings, refetch: refetchMappings } = useProductImageMappings()
  const { generateAutoRules, isGenerating, detectBrandFromTitle, detectCategoryFromTitle } = useAutoMappingRules()
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentUpload, setCurrentUpload] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [newImage, setNewImage] = useState<NewImageForm>({
    files: [],
    label: '',
    category: '',
    brand: '',
    product_type: '',
    tags: ''
  })
  const [newMapping, setNewMapping] = useState<NewMappingForm>({
    image_id: '',
    category: '',
    brand: '',
    product_type: '',
    contains_keywords: '',
    priority: 100
  })

  const handleImageUpload = async () => {
    if (newImage.files.length === 0 || !newImage.category) {
      toast({
        title: "Error",
        description: "Al menos un archivo y categoría son requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      
      const totalFiles = newImage.files.length
      let uploadedCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Sanitize category for folder name
      const sanitizedCategory = newImage.category
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '-') // Replace special chars with hyphens

      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < newImage.files.length; i++) {
        const file = newImage.files[i]
        setCurrentUpload(`Subiendo ${file.name} (${i + 1}/${totalFiles})`)
        
        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} no es una imagen válida`)
          }
          
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error(`${file.name} es demasiado grande (máximo 10MB)`)
          }

          const fileExt = file.name.split('.').pop()
          const fileName = `${sanitizedCategory}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) throw uploadError

          // Create database record
          const { error: dbError } = await supabase
            .from('product_images')
            .insert({
              file_path: fileName,
              label: newImage.label || null,
              category: newImage.category,
              brand: newImage.brand || null,
              product_type: newImage.product_type || null,
              tags: newImage.tags ? newImage.tags.split(',').map(t => t.trim()) : null
            })

          if (dbError) throw dbError
          
          uploadedCount++
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error)
          errors.push(`${file.name}: ${error.message}`)
          errorCount++
        }
        
        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      // Show results
      if (uploadedCount > 0) {
        toast({
          title: "Subida completada",
          description: `${uploadedCount} imagen${uploadedCount > 1 ? 'es' : ''} subida${uploadedCount > 1 ? 's' : ''} correctamente${errorCount > 0 ? ` (${errorCount} errores)` : ''}`
        })
      }
      
      if (errorCount > 0 && uploadedCount === 0) {
        toast({
          title: "Error en la subida",
          description: `No se pudo subir ninguna imagen. ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`,
          variant: "destructive"
        })
      }

      if (uploadedCount > 0) {
        setShowImageDialog(false)
        setNewImage({
          files: [],
          label: '',
          category: '',
          brand: '',
          product_type: '',
          tags: ''
        })
        refetchImages()
      }
    } catch (error: any) {
      console.error('Error in upload process:', error)
      toast({
        title: "Error",
        description: error?.message || "Error inesperado durante la subida",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setCurrentUpload('')
    }
  }

  const removeFile = (index: number) => {
    setNewImage(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleCreateMapping = async () => {
    if (!newMapping.image_id || !newMapping.category) {
      toast({
        title: "Error", 
        description: "Imagen y categoría son requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('product_image_mappings')
        .insert({
          image_id: newMapping.image_id,
          category: newMapping.category,
          brand: newMapping.brand || null,
          product_type: newMapping.product_type || null,
          contains_keywords: newMapping.contains_keywords 
            ? newMapping.contains_keywords.split(',').map(k => k.trim())
            : null,
          priority: newMapping.priority
        })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Regla de mapeo creada"
      })

      setShowMappingDialog(false)
      setNewMapping({
        image_id: '',
        category: '',
        brand: '',
        product_type: '',
        contains_keywords: '',
        priority: 100
      })
      refetchMappings()
    } catch (error) {
      console.error('Error creating mapping:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la regla",
        variant: "destructive"
      })
    }
  }

  const toggleImageActive = async (imageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ active: !currentStatus })
        .eq('id', imageId)

      if (error) throw error

      refetchImages()
    } catch (error) {
      console.error('Error toggling image status:', error)
    }
  }

  const toggleMappingActive = async (mappingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_image_mappings')
        .update({ active: !currentStatus })
        .eq('id', mappingId)

      if (error) throw error

      refetchMappings()
    } catch (error) {
      console.error('Error toggling mapping status:', error)
    }
  }

  const deleteImage = async (imageId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('product-images')
        .remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Imagen eliminada"
      })

      refetchImages()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      })
    }
  }

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('product_image_mappings')
        .delete()
        .eq('id', mappingId)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Regla eliminada"
      })

      refetchMappings()
    } catch (error) {
      console.error('Error deleting mapping:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la regla",
        variant: "destructive"
      })
    }
  }

  const getImageUrl = (filePath: string) => {
    const supabaseUrl = "https://qxodekhmjymqyzudfbtv.supabase.co"
    return `${supabaseUrl}/storage/v1/object/public/product-images/${filePath}`
  }

  return (
    <div className="space-y-6">
      {/* Product Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Banco de Imágenes
          </CardTitle>
          <CardDescription>
            Gestiona las imágenes disponibles para productos
          </CardDescription>
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Subir Imagen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Subir Múltiples Imágenes</DialogTitle>
                <DialogDescription>
                  Selecciona múltiples archivos que compartirán la misma configuración
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-files">Archivos (múltiples)</Label>
                  <Input
                    id="image-files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setNewImage(prev => ({ 
                        ...prev, 
                        files: files
                      }))
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Máximo 10MB por archivo. Formatos: JPG, PNG, WEBP
                  </p>
                </div>
                
                {/* File previews */}
                {newImage.files.length > 0 && (
                  <div>
                    <Label>Archivos seleccionados ({newImage.files.length})</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {newImage.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                              <Image className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{currentUpload}</span>
                      <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="image-label">Etiqueta compartida (opcional)</Label>
                  <Input
                    id="image-label"
                    value={newImage.label}
                    onChange={(e) => setNewImage(prev => ({ 
                      ...prev, 
                      label: e.target.value 
                    }))}
                    placeholder="Ej: Productos premium"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta etiqueta se aplicará a todas las imágenes
                  </p>
                </div>
                <div>
                  <Label htmlFor="image-category">Categoría</Label>
                  <Select
                    value={newImage.category}
                    onValueChange={(value) => setNewImage(prev => ({ 
                      ...prev, 
                      category: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image-brand">Marca (opcional)</Label>
                  <Input
                    id="image-brand"
                    value={newImage.brand}
                  onChange={(e) => setNewImage(prev => ({ 
                    ...prev, 
                    brand: e.target.value 
                  }))}
                  placeholder="Ej: Apple"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Se detectará automáticamente si dejas vacío
                </p>
                </div>
                <div>
                  <Label htmlFor="image-type">Tipo de Producto (opcional)</Label>
                  <Input
                    id="image-type"
                    value={newImage.product_type}
                    onChange={(e) => setNewImage(prev => ({ 
                      ...prev, 
                      product_type: e.target.value 
                    }))}
                  placeholder="Ej: smartphone"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Se sugerirá automáticamente basado en la etiqueta
                </p>
                </div>
                <div>
                  <Label htmlFor="image-tags">Tags (separados por coma)</Label>
                  <Input
                    id="image-tags"
                    value={newImage.tags}
                    onChange={(e) => setNewImage(prev => ({ 
                      ...prev, 
                      tags: e.target.value 
                    }))}
                    placeholder="Ej: premium, nuevo, 128gb"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageDialog(false)}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImageUpload} 
                  disabled={uploading || newImage.files.length === 0}
                >
                  {uploading 
                    ? `Subiendo ${newImage.files.length} imagen${newImage.files.length > 1 ? 'es' : ''}...` 
                    : `Subir ${newImage.files.length} imagen${newImage.files.length > 1 ? 'es' : ''}`
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Etiqueta</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images?.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <img 
                      src={getImageUrl(image.file_path)}
                      alt={image.label || 'Product'}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{image.label || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{image.category}</Badge>
                  </TableCell>
                  <TableCell>{image.brand || '-'}</TableCell>
                  <TableCell>{image.product_type || '-'}</TableCell>
                  <TableCell>
                    {image.tags?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={image.active ? "default" : "secondary"}>
                      {image.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleImageActive(image.id, image.active)}
                      >
                        {image.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteImage(image.id, image.file_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mapping Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reglas de Mapeo</span>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAutoRules}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Auto-generar
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Define qué imagen usar para cada combinación de producto. Usa Auto-generar para crear reglas inteligentes.
          </CardDescription>
          <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
            <DialogTrigger asChild>
              <Button className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Regla de Mapeo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mapping-image">Imagen</Label>
                  <Select
                    value={newMapping.image_id}
                    onValueChange={(value) => setNewMapping(prev => ({ 
                      ...prev, 
                      image_id: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar imagen" />
                    </SelectTrigger>
                    <SelectContent>
                      {images?.filter(img => img.active).map(image => (
                        <SelectItem key={image.id} value={image.id}>
                          {image.label || `${image.category} - ${image.brand || 'Sin marca'}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mapping-category">Categoría</Label>
                  <Select
                    value={newMapping.category}
                    onValueChange={(value) => setNewMapping(prev => ({ 
                      ...prev, 
                      category: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mapping-brand">Marca (opcional)</Label>
                  <Input
                    id="mapping-brand"
                    value={newMapping.brand}
                    onChange={(e) => setNewMapping(prev => ({ 
                      ...prev, 
                      brand: e.target.value 
                    }))}
                    placeholder="Ej: Apple"
                  />
                </div>
                <div>
                  <Label htmlFor="mapping-type">Tipo de Producto (opcional)</Label>
                  <Input
                    id="mapping-type"
                    value={newMapping.product_type}
                    onChange={(e) => setNewMapping(prev => ({ 
                      ...prev, 
                      product_type: e.target.value 
                    }))}
                    placeholder="Ej: smartphone"
                  />
                </div>
                <div>
                  <Label htmlFor="mapping-keywords">Keywords (separadas por coma)</Label>
                  <Input
                    id="mapping-keywords"
                    value={newMapping.contains_keywords}
                    onChange={(e) => setNewMapping(prev => ({ 
                      ...prev, 
                      contains_keywords: e.target.value 
                    }))}
                    placeholder="Ej: pro, max, 256gb"
                  />
                </div>
                <div>
                  <Label htmlFor="mapping-priority">Prioridad</Label>
                  <Input
                    id="mapping-priority"
                    type="number"
                    value={newMapping.priority}
                    onChange={(e) => setNewMapping(prev => ({ 
                      ...prev, 
                      priority: parseInt(e.target.value) || 100 
                    }))}
                    placeholder="100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateMapping}>
                  Crear Regla
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings?.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <img 
                      src={getImageUrl(mapping.product_images.file_path)}
                      alt="Product"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{mapping.category}</Badge>
                  </TableCell>
                  <TableCell>{mapping.brand || '-'}</TableCell>
                  <TableCell>{mapping.product_type || '-'}</TableCell>
                  <TableCell>
                    {mapping.contains_keywords?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>{mapping.priority}</TableCell>
                  <TableCell>
                    <Badge variant={mapping.active ? "default" : "secondary"}>
                      {mapping.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMappingActive(mapping.id, mapping.active)}
                      >
                        {mapping.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMapping(mapping.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}