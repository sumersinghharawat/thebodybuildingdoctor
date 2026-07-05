<x-mail::message>
# New access request

**Name:** {{ $inquiry->name }}  
**Email:** {{ $inquiry->email }}  
@if ($inquiry->phone)
**Phone:** {{ $inquiry->phone }}  
@endif
**Type:** {{ $inquiry->type }}  
@if ($inquiry->course_title)
**Course:** {{ $inquiry->course_title }}  
@endif

@if ($inquiry->message)
**Message**

{{ $inquiry->message }}
@endif

<x-mail::button :url="$adminUrl">
View inquiries
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
