import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  current_bid: number;
  minimum_bid: number;
  bid_increment: number;
  end_time: string;
  status: string;
  image_url: string;
  current_bidder: string;
  total_bids: number;
  created_at: string;
}

interface AuctionForm {
  title: string;
  description: string;
  category: string;
  minimum_bid: number;
  bid_increment: number;
  end_time: string;
  image_url: string;
}

const CATEGORIES = ['Perfumes', 'Licores', 'Vinos', 'Navajas', 'Herramientas', 'Cosméticos'];

export const AuctionManagement = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [formData, setFormData] = useState<AuctionForm>({
    title: '',
    description: '',
    category: '',
    minimum_bid: 0,
    bid_increment: 1,
    end_time: '',
    image_url: ''
  });
  const { toast } = useToast();

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch auctions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      minimum_bid: 0,
      bid_increment: 1,
      end_time: '',
      image_url: ''
    });
    setEditingAuction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAuction) {
        // Update existing auction
        const { error } = await supabase
          .from('auctions')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            minimum_bid: formData.minimum_bid,
            bid_increment: formData.bid_increment,
            end_time: formData.end_time,
            image_url: formData.image_url
          })
          .eq('id', editingAuction.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Auction updated successfully'
        });
      } else {
        // Create new auction
        const { error } = await supabase
          .from('auctions')
          .insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            minimum_bid: formData.minimum_bid,
            bid_increment: formData.bid_increment,
            end_time: formData.end_time,
            image_url: formData.image_url,
            current_bid: formData.minimum_bid,
            status: 'active'
          });

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Auction created successfully'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAuctions();
    } catch (error) {
      console.error('Error saving auction:', error);
      toast({
        title: 'Error',
        description: 'Failed to save auction',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setFormData({
      title: auction.title,
      description: auction.description,
      category: auction.category,
      minimum_bid: auction.minimum_bid,
      bid_increment: auction.bid_increment,
      end_time: new Date(auction.end_time).toISOString().slice(0, 16),
      image_url: auction.image_url
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', auctionId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Auction deleted successfully'
      });
      
      fetchAuctions();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete auction',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (auctionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('auctions')
        .update({ status: newStatus })
        .eq('id', auctionId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Auction status updated successfully'
      });
      
      fetchAuctions();
    } catch (error) {
      console.error('Error updating auction status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update auction status',
        variant: 'destructive'
      });
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || auction.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || auction.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Auction Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAuction ? 'Edit Auction' : 'Create New Auction'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_bid">Minimum Bid ($)</Label>
                  <Input
                    id="minimum_bid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_bid}
                    onChange={(e) => setFormData({ ...formData, minimum_bid: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bid_increment">Bid Increment ($)</Label>
                  <Input
                    id="bid_increment"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.bid_increment}
                    onChange={(e) => setFormData({ ...formData, bid_increment: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/src/assets/product-example.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAuction ? 'Update' : 'Create'} Auction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Auctions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auctions ({filteredAuctions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Minimum Bid</TableHead>
                  <TableHead>Total Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions.map(auction => (
                  <TableRow key={auction.id}>
                    <TableCell className="font-medium">{auction.title}</TableCell>
                    <TableCell>{auction.category}</TableCell>
                    <TableCell>${auction.current_bid.toFixed(2)}</TableCell>
                    <TableCell>${auction.minimum_bid.toFixed(2)}</TableCell>
                    <TableCell>{auction.total_bids}</TableCell>
                    <TableCell>
                      <Select
                        value={auction.status}
                        onValueChange={(value) => handleStatusChange(auction.id, value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(auction.end_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(auction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(auction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};