<x-mail::message>
# New technical support ticket

**From:** {{ $ticket->name }} ({{ $ticket->email }})  
**Subject:** {{ $ticket->subject }}

**Issue**

{{ $ticket->message }}

@if ($ticket->attachments->isNotEmpty())
**Attachments:** {{ $ticket->attachments->count() }} file(s)
@endif

<x-mail::button :url="$adminUrl">
Open ticket
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
