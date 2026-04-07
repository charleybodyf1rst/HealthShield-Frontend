'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Users,
  Mail,
  Phone,
  Ship,
  DollarSign,
  Calendar,
  ChevronRight,
  RefreshCw,
  User,
} from 'lucide-react';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import type { BoatCustomer } from '@/types/plan-crm';

function CustomerCard({ customer, onSelect }: {
  customer: BoatCustomer;
  onSelect: () => void;
}) {
  return (
    <div
      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {(customer.firstName || '?')[0]}{(customer.lastName || '?')[0]}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">
              {customer.firstName} {customer.lastName}
            </h4>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {customer.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-600">
              <Ship className="w-4 h-4" />
              <span className="font-medium">{customer.totalBookings} trips</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm">
              <DollarSign className="w-3 h-3" />
              <span>${(customer.totalSpent ?? 0).toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

export function CustomersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    customers,
    customersLoading,
    fetchCustomers,
    selectCustomer,
  } = useHealthShieldCrmStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    fetchCustomers(searchQuery || undefined);
  };

  // Filter customers client-side for immediate feedback
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (customer.firstName || '').toLowerCase().includes(query) ||
      (customer.lastName || '').toLowerCase().includes(query) ||
      (customer.email || '').toLowerCase().includes(query) ||
      (customer.phone || '').includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={() => fetchCustomers()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-xl font-bold">{customers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Ship className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Repeat Customers</p>
              <p className="text-xl font-bold">
                {customers.filter(c => c.totalBookings > 1).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-xl font-bold">
                ${customers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Bookings</p>
              <p className="text-xl font-bold">
                {customers.length > 0
                  ? (customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Customer Directory
            <Badge variant="secondary" className="ml-2">
              {filteredCustomers.length} customers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onSelect={() => selectCustomer(customer.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No customers found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
