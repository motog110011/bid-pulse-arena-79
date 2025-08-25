import { useState, useEffect } from 'react'
import { useProductImages, useProductImageMappings, type ProductImage, type ProductImageMapping } from '@/hooks/useProductImages'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Upload, Image, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

interface NewImageForm {
  file: File | null
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
  
  const [uploading, setUploading] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [newImage, setNewImage] = useState<NewImageForm>({
    file: null,
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
    if (!newImage.file || !newImage.category) {
      toast({
        title: "Error",
        description: "Archivo y categoría son requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(true)
      
      // Sanitize filename - remove accents and special characters
      const fileExt = newImage.file.name.split('.').pop()
      const sanitizedCategory = newImage.category
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '-') // Replace special chars with hyphens
      
      const fileName = `${sanitizedCategory}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload to storage with proper options
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, newImage.file, {
          contentType: newImage.file.type,
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

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente"
      })

      setShowImageDialog(false)
      setNewImage({
        file: null,
        label: '',
        category: '',
        brand: '',
        product_type: '',
        tags: ''
      })
      refetchImages()
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo subir la imagen",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Nueva Imagen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-file">Archivo</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(prev => ({ 
                      ...prev, 
                      file: e.target.files?.[0] || null 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="image-label">Etiqueta (opcional)</Label>
                  <Input
                    id="image-label"
                    value={newImage.label}
                    onChange={(e) => setNewImage(prev => ({ 
                      ...prev, 
                      label: e.target.value 
                    }))}
                    placeholder="Ej: iPhone 15 Pro"
                  />
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
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleImageUpload} disabled={uploading}>
                  {uploading ? 'Subiendo...' : 'Subir'}
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
          <CardTitle>Reglas de Mapeo</CardTitle>
          <CardDescription>
            Define qué imagen usar para cada combinación de producto
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