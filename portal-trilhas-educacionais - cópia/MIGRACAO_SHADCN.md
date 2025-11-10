# 🎨 Migração para shadcn/ui

## ✅ Instalação Completa

- ✅ shadcn/ui inicializado
- ✅ Tailwind CSS v4 configurado
- ✅ Componentes instalados:
  - Button
  - Card
  - Input
  - Label
  - Select
  - Dialog (Modal)
  - Dropdown Menu
  - Table
  - Badge
  - Avatar
  - Progress
  - Separator
  - Tabs
  - Alert

## 📋 Mapeamento de Componentes

### Modais → Dialog

**Antes (CSS Modules):**
```tsx
<div className={styles.modal}>
  <div className={styles.modalContent}>
    <h2>Título</h2>
    <p>Conteúdo</p>
    <button onClick={onClose}>Fechar</button>
  </div>
</div>
```

**Depois (shadcn/ui):**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>
    
    <div>Conteúdo</div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Cards → Card

**Antes:**
```tsx
<div className={styles.card}>
  <h3>Título</h3>
  <p>Descrição</p>
</div>
```

**Depois:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### Botões → Button

**Antes:**
```tsx
<button className={styles.primaryBtn} onClick={handleClick}>
  Clique aqui
</button>
```

**Depois:**
```tsx
import { Button } from '@/components/ui/button';

<Button onClick={handleClick}>Clique aqui</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Deletar</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Pequeno</Button>
<Button size="lg">Grande</Button>
<Button size="icon">🔍</Button>
```

### Inputs → Input + Label

**Antes:**
```tsx
<input 
  type="text" 
  className={styles.input}
  placeholder="Digite..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Depois:**
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="Digite seu email"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>
```

### Select → Select

**Antes:**
```tsx
<select className={styles.select} value={value} onChange={handleChange}>
  <option value="1">Opção 1</option>
  <option value="2">Opção 2</option>
</select>
```

**Depois:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opção 1</SelectItem>
    <SelectItem value="2">Opção 2</SelectItem>
  </SelectContent>
</Select>
```

### Tabelas → Table

**Antes:**
```tsx
<table className={styles.table}>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.email}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Depois:**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge/Status → Badge

**Antes:**
```tsx
<span className={`${styles.status} ${styles.active}`}>
  Ativo
</span>
```

**Depois:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="outline">Outline</Badge>
```

### Progress Bar → Progress

**Antes:**
```tsx
<div className={styles.progressBar}>
  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
</div>
```

**Depois:**
```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} />
```

### Avatar → Avatar

**Antes:**
```tsx
<img src={user.avatar} alt={user.name} className={styles.avatar} />
```

**Depois:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

### Alerts → Alert

**Antes:**
```tsx
<div className={styles.error}>
  {errorMessage}
</div>
```

**Depois:**
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erro</AlertTitle>
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

### Tabs → Tabs

**Antes:**
```tsx
<div className={styles.tabs}>
  <button className={activeTab === 'tab1' ? styles.active : ''}>Tab 1</button>
  <button className={activeTab === 'tab2' ? styles.active : ''}>Tab 2</button>
</div>
```

**Depois:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo Tab 1</TabsContent>
  <TabsContent value="tab2">Conteúdo Tab 2</TabsContent>
</Tabs>
```

## 🎯 Plano de Migração

### Ordem de Prioridade:

1. **✅ Componentes UI básicos** (Button, Input, Card)
2. **Modais** (LoginModal, RegisterModal, etc.)
3. **Forms** (Login, Profile, etc.)
4. **Tabelas** (AdminTable, etc.)
5. **Dashboard Cards**
6. **Filtros e Selects**

## 📦 Componentes Adicionais Disponíveis

Para instalar mais componentes quando necessário:

```bash
npx shadcn@latest add [component-name]
```

Componentes úteis:
- `form` - Formulários com validação
- `toast` - Notificações
- `popover` - Popovers
- `sheet` - Sidebar/Drawer
- `command` - Command palette
- `calendar` - Calendário
- `checkbox` - Checkbox
- `radio-group` - Radio buttons
- `switch` - Toggle switch
- `slider` - Slider
- `pagination` - Paginação

## 🎨 Customização

Os componentes shadcn/ui são 100% customizáveis!

Edite os arquivos em `src/components/ui/` para ajustar:
- Cores
- Tamanhos
- Animações
- Comportamento

## 🚀 Benefícios

✅ **Acessibilidade** - Componentes acessíveis por padrão  
✅ **Responsivo** - Mobile-first  
✅ **Customizável** - Código 100% editável  
✅ **Type-safe** - TypeScript nativo  
✅ **Consistência** - Design system unificado  
✅ **Performance** - Tree-shaking automático  
✅ **Dark mode** - Suporte nativo  

## 📚 Recursos

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Componentes](https://ui.shadcn.com/docs/components)
- [Temas](https://ui.shadcn.com/themes)
- [Exemplos](https://ui.shadcn.com/examples)
