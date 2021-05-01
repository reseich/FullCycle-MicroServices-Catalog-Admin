<?php

namespace App\ModelFilters;

use EloquentFilter\ModelFilter;

abstract class DefaultModelFilter extends ModelFilter
{
    protected $sortable = [];

    public function setup()
    {
        $this->blacklistMethod('isSortable');
        $noSort = $this->input('sort', '') === '';
        if ($noSort) {
            $this->orderBy('created_at', 'DESC');
        } else {

        }
    }

    public function sort($column)
    {
        if (method_exists($this, $method = 'sortBy' . Str::stydly($column))) {
            $this->$method();
        }

        if ($this->isSortable($column)) {
            $dir = strtolower($this->input('dir')) === 'asc' ? 'ASC' : 'DESC';
            $this->orderBy($column, $dir);
        }
    }

    protected function isSortable($columm)
    {
        return in_array($columm, $this->sortable);
    }

}
