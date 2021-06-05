<?php

namespace App\ModelFilters;

use App\Models\Video;

class VideoFilter extends DefaultModelFilter
{
    protected $sortable = ['title'];

    public function search($search)
    {
        $this->query->where('title', 'LIKE', "%$search%");
    }

//    public function type($type)
//    {
//        $type_ = (int)$type;
//        if (in_array($type_, CastMember::$types)) {
//            $this->orWhere('type', $type_);
//        }
//    }
}
